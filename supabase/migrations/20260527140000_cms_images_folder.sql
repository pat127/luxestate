-- CMS block images (featured properties, testimonials, CEO photo, etc.)
-- Stored under site-assets/cms-images/ via /api/admin/upload-site-image
-- Bucket site-assets is created in 20260523110000_site_assets_bucket.sql

COMMENT ON TABLE public.site_settings IS
  'CMS config (cms_config), property_fields, communities. Image URLs in cms_config.data point to site-assets bucket folders: hero-images, cms-images, logos, property-images.';
