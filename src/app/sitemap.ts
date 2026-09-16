import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/residential`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/commercial`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/international`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms-of-service`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/cookie-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // TODO: Add dynamic routes from properties and projects tables
  // Example implementation:
  // const properties = await fetchProperties();
  // const propertyRoutes = properties.map(p => ({
  //   url: `${siteUrl}/properties/${p.id}`,
  //   lastModified: new Date(p.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }));
  // const projects = await fetchProjects();
  // const projectRoutes = projects.map(p => ({
  //   url: `${siteUrl}/projects/${p.id}`,
  //   lastModified: new Date(p.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }));
  // return [...staticRoutes, ...propertyRoutes, ...projectRoutes];

  return staticRoutes;
}