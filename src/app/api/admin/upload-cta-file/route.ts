import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { SITE_ASSETS_BUCKET } from '@/lib/cmsImages';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 20 * 1024 * 1024; // 20MB for documents
const ALLOWED_MIME_PREFIXES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats', 'application/vnd.ms-', 'text/plain', 'image/'];

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
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, max) || 'file';
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const isAllowed = ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix));
    if (!isAllowed) {
      return NextResponse.json({ error: 'File type not allowed. Please upload a PDF or document file.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds 20MB limit' }, { status: 400 });
    }

    const fileKey = sanitizeSegment((formData.get('fileKey') as string | null) || 'cta-file');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const filePath = `cta-files/${fileKey}_${Date.now()}.${ext}`;

    const sb = serviceClient();

    // Remove old file if path provided
    const oldPath = formData.get('oldPath') as string | null;
    if (oldPath) {
      try {
        await sb.storage.from(SITE_ASSETS_BUCKET).remove([oldPath]);
      } catch {
        // non-blocking
      }
    }

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
    return NextResponse.json({ url: urlData.publicUrl, path: filePath, fileName: file.name });
  } catch (err: unknown) {
    console.error('[upload-cta-file] Unhandled error:', err);
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
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
