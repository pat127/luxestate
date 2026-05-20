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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

    // Use Supabase's built-in password reset email — redirectTo must point to auth/callback
    const { error } = await adminClient.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${siteUrl}/auth/callback?next=/admin/reset-password`,
      }
    );

    if (error) {
      console.error('Failed to send reset email:', error.message);
      return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
    }

    // Always return success (don't reveal whether email exists)
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
