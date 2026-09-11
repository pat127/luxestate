import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Twilio sends inbound WhatsApp messages as form-encoded POST
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = formData.get('From') as string; // whatsapp:+971XXXXXXX
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    if (!from || !body) {
      return new NextResponse('OK', { status: 200 });
    }

    // Normalize phone number
    const phone = from.replace('whatsapp:', '');

    const supabase = await createClient();

    // Try to find matching lead or property owner by phone
    let contactId: string | null = null;
    let contactName: string | null = null;
    let contactType: 'lead' | 'property_owner' | 'contact' = 'contact';

    const { data: lead } = await supabase
      .from('leads')
      .select('id, name, phone')
      .or(`phone.eq.${phone},phone.eq.${phone.replace('+', '')}`)
      .maybeSingle();

    if (lead) {
      contactId = lead.id;
      contactName = lead.name;
      contactType = 'lead';
    } else {
      const { data: owner } = await supabase
        .from('property_owners')
        .select('id, name, mobile')
        .or(`mobile.eq.${phone},mobile.eq.${phone.replace('+', '')}`)
        .maybeSingle();

      if (owner) {
        contactId = owner.id;
        contactName = owner.name;
        contactType = 'property_owner';
      }
    }

    // Log inbound message
    await supabase.from('whatsapp_messages').insert({
      contact_type: contactType,
      contact_id: contactId || '00000000-0000-0000-0000-000000000000',
      contact_name: contactName || phone,
      contact_phone: phone,
      direction: 'inbound',
      message_body: body,
      status: 'delivered',
      twilio_sid: messageSid,
    });

    // Twilio expects TwiML or empty 200 response
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (err: any) {
    console.error('WhatsApp webhook error:', err);
    return new NextResponse('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
