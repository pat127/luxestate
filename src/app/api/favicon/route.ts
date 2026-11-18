import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'assets', 'images', 'app_logo.png');
    const buf = await readFile(filePath);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch {
    return NextResponse.redirect(new URL('/assets/images/app_logo.png', process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com'), 307);
  }
}
