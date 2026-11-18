import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { CMS_IMAGE_FOLDERS, SITE_ASSETS_BUCKET, type CmsImageFolder } from '@/lib/cmsImages';

export const dynamic = 'force-dynamic';

const ALLOWED_FOLDERS = new Set<string>(Object.values(CMS_IMAGE_FOLDERS));
const MAX_BYTES = 10 * 1024 * 1024;

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

function sanitizeSegment(value: string, max = 48): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, max) || 'asset';
}

function resolveFolder(folder?: string | null): CmsImageFolder {
  const f = folder || CMS_IMAGE_FOLDERS.cms;
  if (!ALLOWED_FOLDERS.has(f)) return CMS_IMAGE_FOLDERS.cms;
  return f as CmsImageFolder;
}

function getExtFromContentType(ct: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };
  return map[ct] || 'png';
}

async function fetchRemoteImage(sourceUrl: string) {
  const normalizedUrl = encodeURI(sourceUrl.trim());
  const attempts: Array<RequestInit> = [
    {
      signal: AbortSignal.timeout(30000),
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    },
    {
      signal: AbortSignal.timeout(30000),
      redirect: 'follow',
      headers: {
        'Accept': 'image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    },
    {
      signal: AbortSignal.timeout(30000),
      redirect: 'follow',
    },
  ];

  let lastResponse: Response | null = null;
  let lastError: unknown = null;
  for (const init of attempts) {
    try {
      const res = await fetch(normalizedUrl, init);
      if (res.ok) return { ok: true as const, res };
      lastResponse = res;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastResponse) {
    return { ok: false as const, status: lastResponse.status, statusText: lastResponse.statusText };
  }
  return { ok: false as const, error: lastError };
}

async function removeOldFile(sb: ReturnType<typeof serviceClient>, oldPath?: string | null) {
  if (!oldPath) return;
  try {
    await sb.storage.from(SITE_ASSETS_BUCKET).remove([oldPath]);
  } catch {
    // non-blocking
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      let body = await req.json();
      const { sourceUrl, folder, fileKey, oldPath } = body as {
        sourceUrl?: string;
        folder?: string;
        fileKey?: string;
        oldPath?: string;
      };

      if (!sourceUrl) {
        return NextResponse.json({ error: 'No sourceUrl provided' }, { status: 400 });
      }

      const isHttp = /^https?:\/\//i.test(sourceUrl.trim());
      if (!isHttp) {
        return NextResponse.json({ error: 'sourceUrl must be an absolute http(s) URL' }, { status: 400 });
      }

      const fetched = await fetchRemoteImage(sourceUrl);
      if (!fetched.ok) {
        if ('status' in fetched) {
          return NextResponse.json(
            { error: `Failed to fetch image: ${fetched.status} ${fetched.statusText || ''}`.trim() },
            { status: 400 },
          );
        }
        const msg = fetched.error instanceof Error ? fetched.error.message : 'request failed';
        return NextResponse.json({ error: `Failed to fetch image: ${msg}` }, { status: 400 });
      }
      const imgRes = fetched.res;

      const imgContentType = imgRes.headers.get('content-type')?.split(';')[0]?.trim() || 'image/png';
      const ext = getExtFromContentType(imgContentType);
      const buffer = await imgRes.arrayBuffer();

      if (buffer.byteLength > MAX_BYTES) {
        return NextResponse.json({ error: 'Image exceeds 10MB limit' }, { status: 400 });
      }

      const dir = resolveFolder(folder);
      const key = sanitizeSegment(fileKey || 'cms');
      const filePath = `${dir}/${key}_${Date.now()}.${ext}`;
      const sb = serviceClient();

      await removeOldFile(sb, oldPath);

      const { error: uploadError } = await sb.storage
        .from(SITE_ASSETS_BUCKET)
        .upload(filePath, new Uint8Array(buffer), {
          contentType: imgContentType,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: urlData } = sb.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(filePath);
      return NextResponse.json({ url: urlData.publicUrl, path: filePath });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'parse error';
      return NextResponse.json({ error: 'Invalid form data: ' + msg }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const dir = resolveFolder(formData.get('folder') as string | null);
    const key = sanitizeSegment((formData.get('fileKey') as string | null) || 'cms');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filePath = `${dir}/${key}_${Date.now()}.${ext}`;

    const sb = serviceClient();
    const oldPath = formData.get('oldPath') as string | null;
    const arrayBuffer = await file.arrayBuffer();

    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Image exceeds 10MB limit' }, { status: 400 });
    }

    await removeOldFile(sb, oldPath);

    const { error: uploadError } = await sb.storage
      .from(SITE_ASSETS_BUCKET)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = sb.storage.from(SITE_ASSETS_BUCKET).getPublicUrl(filePath);
    return NextResponse.json({ url: urlData.publicUrl, path: filePath });
  } catch (err: unknown) {
    console.error('[upload-site-image] Unhandled error:', err);
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { path?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { path } = body;
    if (!path) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }

    const sb = serviceClient();
    const { error } = await sb.storage.from(SITE_ASSETS_BUCKET).remove([path]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[upload-site-image] DELETE unhandled error:', err);
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
