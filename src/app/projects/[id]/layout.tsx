import type { Metadata } from 'next';
import { generateMetadata as getMetadata } from './metadata';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return getMetadata({ params });
}

export default async function ProjectDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Projects', url: `${siteUrl}/projects` },
    { name: 'Project Details', url: `${siteUrl}/projects/${id}` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {children}
    </>
  );
}
