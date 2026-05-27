import type { BrandingConfig, PageConfig, ProjectDetailContent, PropertyDetailContent } from '@/contexts/CMSContext';

export const SITE_ASSETS_BUCKET = 'site-assets';
export const CMS_IMAGE_FOLDERS = {
  hero: 'hero-images',
  cms: 'cms-images',
  logos: 'logos',
  property: 'property-images',
} as const;

export type CmsImageFolder = (typeof CMS_IMAGE_FOLDERS)[keyof typeof CMS_IMAGE_FOLDERS];

/** Extract storage path after /site-assets/ from a public URL */
export function getSiteAssetsPath(url?: string | null): string | null {
  if (!url) return null;
  try {
    const marker = `/${SITE_ASSETS_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.substring(idx + marker.length).split('?')[0] || '');
  } catch {
    return null;
  }
}

export function isSiteAssetsUrl(url?: string | null): boolean {
  return Boolean(url && url.includes(`/${SITE_ASSETS_BUCKET}/`));
}

/** Collect every image URL stored in cms_config payload */
export function extractCmsImageUrls(
  pages: PageConfig[],
  branding: BrandingConfig,
  propertyDetail?: PropertyDetailContent,
  projectDetail?: ProjectDetailContent,
): string[] {
  const urls: string[] = [];

  const push = (u?: string | null) => {
    if (u && (u.startsWith('http') || u.startsWith('/'))) urls.push(u);
  };

  push(branding.logo_url);

  for (const page of pages) {
    push(page.hero_image);
    page.featured_properties_content?.properties?.forEach((p) => push(p.image));
    page.featured_projects_content?.projects?.forEach((p) => push(p.image));
    page.why_luxestate_content?.steps?.forEach((s) => push(s.image));
    page.testimonials_content?.testimonials?.forEach((t) => push(t.image));
    push(page.about_content?.ceo?.image);
  }

  propertyDetail?.images?.forEach((img) => push(img.src));
  push(propertyDetail?.agent?.avatar);

  projectDetail?.images?.forEach((img) => push(img.src));
  push(projectDetail?.agent?.avatar);

  return urls;
}
