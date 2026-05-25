import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const BUCKET = 'site-assets';
const FOLDER = 'property-images';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB per image
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function getAuthUser() {
  try {
    const supabaseAuth = await createServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

function extFromContentType(ct: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
  };
  return map[ct] || 'jpg';
}

function sanitizeFolder(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
}

async function fetchAndUploadOne(
  sb: ReturnType<typeof serviceClient>,
  url: string,
  index: number,
  subfolder: string,
): Promise<{ original: string; uploaded: string } | { original: string; error: string }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'CoveEstates-ImageUploader/1.0' },
    });

    if (!res.ok) {
      return { original: url, error: `HTTP ${res.status}` };
    }

    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg';
    if (!ALLOWED_TYPES.includes(contentType)) {
      return { original: url, error: `Unsupported type: ${contentType}` };
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE) {
      return { original: url, error: 'Image exceeds 10 MB limit' };
    }

    const ext = extFromContentType(contentType);
    const filePath = `${FOLDER}/${subfolder}/${index + 1}_${Date.now()}.${ext}`;

    const { error: uploadError } = await sb.storage
      .from(BUCKET)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      return { original: url, error: uploadError.message };
    }

    const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(filePath);
    return { original: url, uploaded: urlData.publicUrl };
  } catch (err: any) {
    return { original: url, error: err?.message || 'Fetch failed' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { urls: string[]; propertyId?: string; referenceNumber?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { urls, propertyId, referenceNumber } = body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    if (urls.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 images per batch' }, { status: 400 });
    }

    const subfolder = sanitizeFolder(propertyId || referenceNumber || `unlinked_${Date.now()}`);

    const sb = serviceClient();
    const results = await Promise.all(
      urls.map((url, i) => fetchAndUploadOne(sb, url.trim(), i, subfolder)),
    );

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('[upload-property-images] Unhandled error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
