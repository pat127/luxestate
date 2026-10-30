import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

// Placeholder/default values that indicate credentials are not set
const PLACEHOLDER_VALUES = [
  'your-twilio-account-sid-here',
  'your-twilio-auth-token-here',
  'your_twilio_account_sid',
  'your_twilio_auth_token',
  'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
];

function isPlaceholder(value?: string) {
  if (!value) return true;
  return PLACEHOLDER_VALUES.some(p => value.toLowerCase().includes(p.toLowerCase().split('-')[0]));
}

/**
 * Normalize a phone number to E.164 format for WhatsApp.
 * Handles UAE numbers (05x, 971x), international (+xx), and plain digits.
 */
function normalizePhone(raw: string): string {
  // Strip all non-digit characters except leading +
  const stripped = raw.trim().replace(/[\s\-().]/g, '');

  // Already has whatsapp: prefix
  if (stripped.startsWith('whatsapp:')) {
    return stripped;
  }

  let digits = stripped.replace(/^\+/, '');

  // UAE local format: starts with 05 → 9715
  if (digits.startsWith('05') && digits.length === 10) {
    digits = '971' + digits.slice(1); // 05x → 9715x
  }
  // UAE local format: starts with 5 and 9 digits → 9715x
  else if (digits.startsWith('5') && digits.length === 9) {
    digits = '971' + digits;
  }
  // Already has country code (10+ digits, no leading 0)
  // e.g. 971501234567, 447911123456 — keep as-is

  return `whatsapp:+${digits}`;
}

async function sendTwilioWhatsApp(to: string, body: string) {
  if (
    !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM ||
    isPlaceholder(TWILIO_ACCOUNT_SID) || isPlaceholder(TWILIO_AUTH_TOKEN)
  ) {
    throw new Error(
      'Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM in your environment variables.'
    );
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

  const toFormatted = normalizePhone(to);

  const formData = new URLSearchParams({
    To: toFormatted,
    From: TWILIO_WHATSAPP_FROM,
    Body: body,
  });

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    // Twilio error codes: https://www.twilio.com/docs/api/errors
    const twilioMsg = data?.message || 'Twilio API error';
    const twilioCode = data?.code ? ` (code ${data.code})` : '';
    throw new Error(`${twilioMsg}${twilioCode}`);
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { recipients, message, bulkSendTitle, campaignId, campaignName } = body as {
      recipients: { id: string; name: string; phone: string; type: 'lead' | 'property_owner' | 'contact' }[];
      message: string;
      bulkSendTitle?: string;
      campaignId?: string;
      campaignName?: string;
    };

    if (!recipients?.length || !message) {
      return NextResponse.json({ error: 'Missing recipients or message' }, { status: 400 });
    }

    // Validate at least one recipient has a phone number
    const recipientsWithPhone = recipients.filter(r => r.phone?.trim());
    if (recipientsWithPhone.length === 0) {
      return NextResponse.json({ error: 'No recipients have a phone number' }, { status: 400 });
    }

    // Early check: fail fast if Twilio not configured
    if (
      !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM ||
      isPlaceholder(TWILIO_ACCOUNT_SID) || isPlaceholder(TWILIO_AUTH_TOKEN)
    ) {
      return NextResponse.json(
        { error: 'Twilio credentials are not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM in your environment variables.' },
        { status: 503 }
      );
    }

    // Get sender profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    const senderName = profile?.full_name || user.email || 'CRM User';

    // Create bulk send record
    const { data: bulkSend } = await supabase
      .from('whatsapp_bulk_sends')
      .insert({
        title: bulkSendTitle || `Bulk send to ${recipients.length} contacts`,
        message_body: message,
        recipient_type: recipients.every(r => r.type === 'lead') ? 'leads'
          : recipients.every(r => r.type === 'property_owner') ? 'property_owners' : 'mixed',
        total_recipients: recipients.length,
        status: 'in_progress',
        sent_by: user.id,
        sent_by_name: senderName,
        campaign_id: campaignId || null,
        campaign_name: campaignName || null,
      })
      .select()
      .single();

    let sentCount = 0;
    let failedCount = 0;
    const results: { id: string; status: string; error?: string }[] = [];

    for (const recipient of recipients) {
      let twilioSid: string | null = null;
      let status: 'sent' | 'failed' = 'sent';
      let errorMsg: string | null = null;

      if (!recipient.phone?.trim()) {
        status = 'failed';
        errorMsg = 'No phone number';
        failedCount++;
      } else {
        try {
          const twilioResult = await sendTwilioWhatsApp(recipient.phone, message);
          twilioSid = twilioResult.sid;
          sentCount++;
        } catch (err: any) {
          status = 'failed';
          errorMsg = err.message;
          failedCount++;
        }
      }

      // Log message to DB
      await supabase.from('whatsapp_messages').insert({
        contact_type: recipient.type,
        contact_id: recipient.id,
        contact_name: recipient.name,
        contact_phone: recipient.phone,
        direction: 'outbound',
        message_body: message,
        status,
        twilio_sid: twilioSid,
        error_message: errorMsg,
        sent_by: user.id,
        sent_by_name: senderName,
        campaign_id: campaignId || null,
        campaign_name: campaignName || null,
      });

      results.push({ id: recipient.id, status, error: errorMsg || undefined });
    }

    // Update bulk send record
    if (bulkSend) {
      await supabase
        .from('whatsapp_bulk_sends')
        .update({
          sent_count: sentCount,
          failed_count: failedCount,
          status: failedCount === recipients.length ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', bulkSend.id);
    }

    return NextResponse.json({ success: true, sentCount, failedCount, results });
  } catch (err: any) {
    console.error('WhatsApp send error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
