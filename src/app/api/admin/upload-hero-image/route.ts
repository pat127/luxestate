import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const BUCKET = 'site-assets';
const FOLDER = 'hero-images';
const CMS_KEY = 'cms_config';

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

async function removeOldFile(sb: ReturnType<typeof serviceClient>, oldPath: string | null) {
  if (oldPath) {
    await sb.storage.from(BUCKET).remove([oldPath]);
  }
}

async function updateCmsHeroImage(
  sb: ReturnType<typeof serviceClient>,
  pageKey: string | null | undefined,
  url: string,
  userId: string,
) {
  if (!pageKey) return;
  try {
    const { data: row, error: readErr } = await sb
      .from('site_settings')
      .select('data')
      .eq('key', CMS_KEY)
      .single();
    if (readErr || !row?.data) return;

    const next = { ...(row.data as any) };
    const pages = Array.isArray(next.pages) ? [...next.pages] : [];
    const idx = pages.findIndex((p: any) => p?.key === pageKey);
    if (idx === -1) return;
    pages[idx] = { ...pages[idx], hero_image: url };
    next.pages = pages;

    await sb
      .from('site_settings')
      .update({ data: next, updated_at: new Date().toISOString(), updated_by: userId })
      .eq('key', CMS_KEY);
  } catch {
    // non-blocking
  }
}

async function clearCmsHeroImage(
  sb: ReturnType<typeof serviceClient>,
  pageKey: string | null | undefined,
  userId: string,
) {
  if (!pageKey) return;
  try {
    const { data: row, error: readErr } = await sb
      .from('site_settings')
      .select('data')
      .eq('key', CMS_KEY)
      .single();
    if (readErr || !row?.data) return;

    const next = { ...(row.data as any) };
    const pages = Array.isArray(next.pages) ? [...next.pages] : [];
    const idx = pages.findIndex((p: any) => p?.key === pageKey);
    if (idx === -1) return;
    pages[idx] = { ...pages[idx], hero_image: '' };
    next.pages = pages;

    await sb
      .from('site_settings')
      .update({ data: next, updated_at: new Date().toISOString(), updated_by: userId })
      .eq('key', CMS_KEY);
  } catch {
    // non-blocking
  }
}

function getExtFromContentType(ct: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
    'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg',
  };
  return map[ct] || 'png';
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { sourceUrl, pageKey, oldPath } = body as { sourceUrl?: string; pageKey?: string; oldPath?: string };

      if (!sourceUrl) {
        return NextResponse.json({ error: 'No sourceUrl provided' }, { status: 400 });
      }

      const imgRes = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
      if (!imgRes.ok) {
        return NextResponse.json({ error: `Failed to fetch image: ${imgRes.status}` }, { status: 400 });
      }

      const imgContentType = imgRes.headers.get('content-type') || 'image/png';
      const ext = getExtFromContentType(imgContentType);
      const buffer = await imgRes.arrayBuffer();

      if (buffer.byteLength > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image exceeds 10MB limit' }, { status: 400 });
      }

      const filePath = `${FOLDER}/${pageKey || 'page'}_hero_${Date.now()}.${ext}`;
      const sb = serviceClient();

      await removeOldFile(sb, oldPath || null);

      const { error: uploadError } = await sb.storage
        .from(BUCKET)
        .upload(filePath, new Uint8Array(buffer), {
          contentType: imgContentType,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(filePath);
      await updateCmsHeroImage(sb, pageKey, urlData.publicUrl, user.id);
      return NextResponse.json({ url: urlData.publicUrl, path: filePath });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err: any) {
      return NextResponse.json({ error: 'Invalid form data: ' + (err?.message || 'parse error') }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    const pageKey = formData.get('pageKey') as string | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const filePath = `${FOLDER}/${pageKey || 'page'}_hero_${Date.now()}.${ext}`;

    const sb = serviceClient();
    const oldPath = formData.get('oldPath') as string | null;
    await removeOldFile(sb, oldPath);
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await sb.storage
      .from(BUCKET)
      .upload(filePath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(filePath);
    await updateCmsHeroImage(sb, pageKey, urlData.publicUrl, user.id);
    return NextResponse.json({ url: urlData.publicUrl, path: filePath });
  } catch (err: any) {
    console.error('[upload-hero-image] Unhandled error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { path?: string; pageKey?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { path, pageKey } = body;
    if (!path) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }

    const sb = serviceClient();
    const { error } = await sb.storage.from(BUCKET).remove([path]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await clearCmsHeroImage(sb, pageKey, user.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[upload-hero-image] DELETE unhandled error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
