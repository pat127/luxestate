import { MetadataRoute } from 'next';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Cache the sitemap for 1 hour instead of regenerating per request; crawlers get a stable, fast response.
export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

async function fetchDynamicRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    // Cookie-free anon client: sitemap must be generated for any user agent without auth/session.
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const [props, projects, posts] = await Promise.all([
      supabase.from('properties').select('id, updated_at, created_at').eq('published', true),
      supabase.from('projects').select('id, updated_at, created_at').eq('published', true),
      supabase.from('blog_posts').select('slug, created_at, publish_date').eq('status', 'Published'),
    ]);

    const routes: MetadataRoute.Sitemap = [];
    (props.data ?? []).forEach((p: any) =>
      routes.push({
        url: `${siteUrl}/properties/${p.id}`,
        lastModified: new Date(p.updated_at || p.created_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    );
    (projects.data ?? []).forEach((p: any) =>
      routes.push({
        url: `${siteUrl}/projects/${p.id}`,
        lastModified: new Date(p.updated_at || p.created_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    );
    (posts.data ?? []).forEach((p: any) =>
      routes.push({
        url: `${siteUrl}/blog/${p.slug}`,
        lastModified: new Date(p.publish_date || p.created_at || Date.now()),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    );
    return routes;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Static routes are always emitted, even if the database lookup fails, so crawlers never receive an empty sitemap.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/residential`, lastModified, changeFrequency: 'daily', priority: 0.95 },
    { url: `${siteUrl}/commercial`, lastModified, changeFrequency: 'daily', priority: 0.95 },
    { url: `${siteUrl}/projects`, lastModified, changeFrequency: 'daily', priority: 0.95 },
    { url: `${siteUrl}/blog`, lastModified, changeFrequency: 'daily', priority: 0.85 },
    { url: `${siteUrl}/faqs`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/international`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/privacy-policy`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/terms-of-service`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/cookie-policy`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const dynamicRoutes = await fetchDynamicRoutes();
  return [...staticRoutes, ...dynamicRoutes];
}