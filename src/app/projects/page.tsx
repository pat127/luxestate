import JsonLd from '@/components/JsonLd';
import ProjectsPageClient from './ProjectsPageClient';
import { fetchProjects } from '@/lib/seo/serverData';
import { generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo/schemas';

export { metadata } from './metadata';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export default async function ProjectsPage() {
  const projects = await fetchProjects();

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
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumb} />
      <ProjectsPageClient initialProjects={projects} />
    </>
  );
}