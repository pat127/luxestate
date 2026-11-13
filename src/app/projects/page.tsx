import JsonLd from '@/components/JsonLd';
import ProjectsPageClient from './ProjectsPageClient';
import { fetchProjects } from '@/lib/seo/serverData';
import { generateBreadcrumbSchema, generateItemListSchema, generateWebPageSchema } from '@/lib/seo/schemas';

export { metadata } from './metadata';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export default async function ProjectsPage() {
  const projects = await fetchProjects();

  const webPage = generateWebPageSchema({
    name: 'Off-Plan Projects Dubai',
    description: 'Curated off-plan residential and commercial developments in Dubai with flexible payment plans.',
    url: `${siteUrl}/projects`,
    type: 'CollectionPage',
  });
  const itemList = generateItemListSchema(
    'Off-Plan Projects in Dubai',
    `${siteUrl}/projects`,
    projects?.map((p) => ({ name: p?.name, url: `${siteUrl}/projects/${p?.id}` }))
  );
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Projects', url: `${siteUrl}/projects` },
  ]);

  return (
    <>
      <JsonLd data={webPage} />
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumb} />
      <ProjectsPageClient initialProjects={projects} />
    </>
  );
}