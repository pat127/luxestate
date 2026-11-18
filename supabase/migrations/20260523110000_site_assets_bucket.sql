-- ─── Site Assets Storage Bucket ──────────────────────────────────────────────
-- Public bucket for branding assets (logos, favicons, etc.)
-- Uploaded via admin /admin/settings and served to all visitors.

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read (public bucket)
CREATE POLICY "Public read site-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

-- Authenticated users can upload
CREATE POLICY "Auth users upload site-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

-- Authenticated users can update (replace)
CREATE POLICY "Auth users update site-assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

-- Authenticated users can delete
CREATE POLICY "Auth users delete site-assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');
