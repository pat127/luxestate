import JsonLd from '@/components/JsonLd';
import ResidentialPageClient from './ResidentialPageClient';
import { fetchResidentialListings } from '@/lib/seo/serverData';
import { generateBreadcrumbSchema, generateItemListSchema, generateWebPageSchema } from '@/lib/seo/schemas';

export { metadata } from './metadata';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export default async function ResidentialPage() {
  const listings = await fetchResidentialListings();

  const webPage = generateWebPageSchema({
    name: 'Luxury Residential Properties Dubai',
    description: 'Premium villas, penthouses and apartments in Dubai Marina, Palm Jumeirah, Emirates Hills and Downtown Dubai.',
    url: `${siteUrl}/residential`,
    type: 'CollectionPage',
  });
  const itemList = generateItemListSchema(
    'Residential Properties in Dubai',
    `${siteUrl}/residential`,
    listings?.map((l) => ({ name: l?.name, url: `${siteUrl}/properties/${l?.id}` }))
  );
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Residential', url: `${siteUrl}/residential` },
  ]);

  return (
    <>
      <JsonLd data={webPage} />
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumb} />
      <ResidentialPageClient initialListings={listings} />
    </>
  );
}