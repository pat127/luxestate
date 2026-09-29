import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    // Verify service role key is available
    if (!SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { name, email, password, role, permissions, phone, status } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, role' },
        { status: 400 }
      );
    }

    // Create admin client with service role (bypasses RLS and email confirmation)
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create auth user with email_confirm: true (no confirmation email needed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role,
        permissions: permissions || {},
      },
      app_metadata: {
        role,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User created but no ID returned' }, { status: 500 });
    }

    // Upsert user profile (trigger may have already created it)
    const { error: profileError } = await supabaseAdmin.from('user_profiles').upsert(
      {
        id: userId,
        email,
        full_name: name,
        role,
        status: status || 'Active',
        phone: phone || null,
        permissions: permissions || {},
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      // Auth user was created but profile failed — still return success with warning
      console.error('Profile upsert error:', profileError.message);
      return NextResponse.json(
        { success: true, userId, warning: 'Profile setup had an issue: ' + profileError.message },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, userId }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
