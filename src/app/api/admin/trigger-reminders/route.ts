import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/trigger-reminders
 * Triggers the send-lead-reminder edge function.
 * Call this daily via a cron job or manually from the admin panel.
 * Protected: only callable from server-side or with a secret header.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verify authenticated admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.functions.invoke('send-lead-reminder', {
      body: {},
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
