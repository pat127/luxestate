import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';
import FAQsPageClient from './FAQsPageClient';
import { fetchFaqs } from '@/lib/seo/serverData';
import { generateFAQSchema, generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export const metadata: Metadata = {
  title: 'Dubai Property FAQs — Buying, Selling & Renting Questions Answered',
  description:
    'Direct answers to the most common questions about buying, selling, renting and investing in Dubai property, from the Cove Estates advisory team.',
  alternates: { canonical: `${siteUrl}/faqs` },
};

export default async function FAQsPage() {
  const faqs = await fetchFaqs();
  const faqSchema = generateFAQSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })));
  const webPage = generateWebPageSchema({
    name: 'Dubai Property FAQs',
    description: 'Answers to common questions about buying, selling, renting and investing in Dubai property.',
    url: `${siteUrl}/faqs`,
    type: 'FAQPage',
  });
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'FAQs', url: `${siteUrl}/faqs` },
  ]);

  return (
    <>
      {faqs.length > 0 && <JsonLd data={faqSchema} />}
      <JsonLd data={webPage} />
      <JsonLd data={breadcrumb} />
      <FAQsPageClient initialFaqs={faqs} />
    </>
  );
}
