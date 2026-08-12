import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886

async function sendTwilioWhatsApp(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    throw new Error('Twilio credentials not configured');
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

  // Normalize phone: ensure whatsapp: prefix
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : '+' + to}`;

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
    throw new Error(data?.message || 'Twilio API error');
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

      try {
        const twilioResult = await sendTwilioWhatsApp(recipient.phone, message);
        twilioSid = twilioResult.sid;
        sentCount++;
      } catch (err: any) {
        status = 'failed';
        errorMsg = err.message;
        failedCount++;
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
