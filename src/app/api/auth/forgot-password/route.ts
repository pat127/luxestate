import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/auth/forgot-password
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Check if user exists in user_profiles
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!profile) {
      // Return success even if not found (security: don't reveal if email exists)
      return NextResponse.json({ success: true });
    }

    // Generate password reset link via Supabase admin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email,
      options: {
        redirectTo: `${siteUrl}/admin/reset-password`,
      },
    });

    if (linkError) {
      console.error('Failed to generate reset link:', linkError.message);
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 });
    }

    // Send email via Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    await fetch(`${supabaseUrl}/functions/v1/send-user-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        type: 'reset',
        to: profile.email,
        email: profile.email,
        reset_link: linkData.properties?.action_link,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
