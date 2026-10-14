import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const logoUrl = new URL('/assets/images/app_logo.png', request.url);
    const res = await fetch(logoUrl.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('logo fetch failed');
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch {
    return NextResponse.redirect(new URL('/assets/images/app_logo.png?v=3', request.url), 307);
  }
}
