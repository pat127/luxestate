import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/admin/users/reset-password — superadmin only: reset user password
export async function POST(req: NextRequest) {
  try {
    const { id, email, full_name, password, requestingUserId } = await req.json();

    if (!id || !email || !password) {
      return NextResponse.json({ error: 'id, email, and password are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Verify the requesting user is a super_admin
    if (requestingUserId) {
      const { data: requester, error: requesterError } = await adminClient
        .from('user_profiles')
        .select('role')
        .eq('id', requestingUserId)
        .single();

      if (requesterError || !requester) {
        return NextResponse.json({ error: 'Could not verify requester identity' }, { status: 403 });
      }

      if (requester.role !== 'super_admin') {
        return NextResponse.json({ error: 'Only super admins can reset passwords' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Requester identity is required' }, { status: 403 });
    }

    // Update the user's auth password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(id, { password });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Store new password in user_profiles
    await adminClient
      .from('user_profiles')
      .update({ password, updated_at: new Date().toISOString() })
      .eq('id', id);

    // Send welcome email with new credentials (non-blocking)
    try {
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
    } catch {
      // Non-blocking — password was still reset
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
