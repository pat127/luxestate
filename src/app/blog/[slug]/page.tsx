import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';
import JsonLd from '@/components/JsonLd';
import { fetchBlogPostBySlug } from '@/lib/seo/serverData';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await fetchBlogPostBySlug(slug);
  if (!post) return { title: 'Article Not Found' };
  const description = post.excerpt || `Read ${post.title} on the Cove Estates Dubai real estate journal.`;
  return {
    title: post.title,
    description,
    authors: [{ name: post.author }],
    alternates: { canonical: `${siteUrl}/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: `${siteUrl}/blog/${post.slug}`,
      publishedTime: post.publish_date || post.created_at,
      authors: [post.author],
      images: post.featured_image ? [{ url: post.featured_image, alt: post.title }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post, related } = await fetchBlogPostBySlug(slug);
  if (!post) notFound();

  const article = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    image: post.featured_image,
    author: post.author || 'Cove Estates',
    authorUrl: 'https://linkedin.com/company/coveestates',
    datePublished: post.publish_date || post.created_at,
    category: post.category,
  });

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Journal', url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/blog/${post.slug}` },
  ]);

  return (
    <>
      <JsonLd data={article} />
      <JsonLd data={breadcrumb} />
      <BlogPostClient post={post} related={related} />
    </>
  );
}
