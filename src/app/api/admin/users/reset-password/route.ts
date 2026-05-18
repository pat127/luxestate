import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/admin/users/reset-password — reset user password and resend credentials
export async function POST(req: NextRequest) {
  try {
    const { id, email, full_name, password } = await req.json();

    if (!id || !email || !password) {
      return NextResponse.json({ error: 'id, email, and password are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Update the user's password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(id, { password });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Send welcome email with new credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    await fetch(`${supabaseUrl}/functions/v1/send-user-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        type: 'welcome',
        to: email,
        full_name: full_name || email,
        email,
        password,
        user_id: id,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
