import { NextRequest, NextResponse } from 'next/server';

const MAPBOX_TOKEN = process.env.MAPBOX_SECRET_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  if (!MAPBOX_TOKEN) {
    return new NextResponse('Mapbox token not configured', { status: 500 });
  }

  // Await params — required in Next.js 15
  const { slug } = await params;

  // Expected pattern: z/x/y  (last 3 segments)
  if (slug.length < 3) {
    return new NextResponse('Invalid tile path', { status: 400 });
  }

  const [z, x, yRaw] = slug.slice(-3);
  // Strip any @2x suffix — we request 512px tiles directly
  const y = yRaw.replace(/@2x\.(png|jpg|webp)$/i, '').replace(/\.(png|jpg|webp)$/i, '');

  // Build Mapbox raster tile URL (Mapbox Streets style, English labels, 512px @2x)
  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/${z}/${x}/${y}@2x?access_token=${MAPBOX_TOKEN}`;

  try {
    const res = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'CoveEstates/1.0',
      },
      // Cache tiles for 1 hour
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`Mapbox tile fetch failed: ${res.status} for ${tileUrl}`);
      return new NextResponse('Tile fetch failed', { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/png';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Mapbox proxy error:', err);
    return new NextResponse('Proxy error', { status: 502 });
  }
}
