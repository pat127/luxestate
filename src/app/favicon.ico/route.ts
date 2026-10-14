import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/assets/images/app_logo.png?v=2', request.url), 307);
}
