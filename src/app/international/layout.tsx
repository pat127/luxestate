import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export const metadata: Metadata = {
  title: 'International Property Investment — Cove Estates',
  description: 'International property opportunities curated by Cove Estates for global investors.',
  alternates: { canonical: `${siteUrl}/international` },
};

export default function InternationalLayout({ children }: { children: React.ReactNode }) {
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'International', url: `${siteUrl}/international` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {children}
    </>
  );
}
