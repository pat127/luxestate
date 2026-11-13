import type { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';
import JsonLd from '@/components/JsonLd';
import { fetchBlogPosts } from '@/lib/seo/serverData';
import { generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/seo/schemas';

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export const metadata: Metadata = {
  title: 'Dubai Real Estate Journal — Market Insights & Investment Guides',
  description:
    'Expert perspectives on the Dubai property market: market trends, off-plan investment guides, legal insights and lifestyle features from the Cove Estates team.',
  alternates: { canonical: `${siteUrl}/blog` },
};

export default async function BlogPage() {
  const posts = await fetchBlogPosts();
  const webPage = generateWebPageSchema({
    name: 'Dubai Real Estate Journal',
    description: 'Market insights, off-plan guides and investment articles from the Cove Estates team.',
    url: `${siteUrl}/blog`,
    type: 'CollectionPage',
  });
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Journal', url: `${siteUrl}/blog` },
  ]);

  return (
    <>
      <JsonLd data={webPage} />
      <JsonLd data={breadcrumb} />
      <BlogPageClient initialPosts={posts} />
    </>
  );
}
