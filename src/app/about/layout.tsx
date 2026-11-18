import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export const metadata: Metadata = {
  title: 'About Cove Estates — Dubai Real Estate Advisors',
  description:
    'Cove Estates is a Dubai real estate agency advising buyers, sellers and investors on residential, commercial and off-plan property.',
  alternates: { canonical: `${siteUrl}/about` },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'About', url: `${siteUrl}/about` },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      {children}
    </>
  );
}
