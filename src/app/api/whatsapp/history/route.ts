import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');
    const contactPhone = searchParams.get('phone');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (contactId) {
      query = query.eq('contact_id', contactId);
    } else if (contactPhone) {
      query = query.eq('contact_phone', contactPhone);
    } else {
      return NextResponse.json({ error: 'contactId or phone required' }, { status: 400 });
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
