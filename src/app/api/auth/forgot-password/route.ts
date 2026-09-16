import { NextResponse } from 'next/server';

// Forgot password feature has been disabled.
// Password management is handled exclusively by super admins via the admin panel.
export async function POST() {
  return NextResponse?.json({ error: 'Forgot password is not available. Contact your administrator.' }, { status: 403 });
}
