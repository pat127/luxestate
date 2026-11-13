import JsonLd from '@/components/JsonLd';
import CommercialPageClient from './CommercialPageClient';
import { fetchCommercialListings, formatNumber } from '@/lib/seo/serverData';
import { generateBreadcrumbSchema, generateItemListSchema, generateWebPageSchema } from '@/lib/seo/schemas';
import { PRICING } from '@/lib/seo/author';

export { metadata } from './metadata';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export default async function CommercialPage() {
  const listings = await fetchCommercialListings();

  // Indicative pricing: lowest published sale price; advisory and leasing fees are quoted on request.
  const salePrices = listings?.filter((l) => !l?.isRent && l?.priceRaw > 0)?.map((l) => l?.priceRaw);
  const minSale = salePrices?.length > 0 ? Math.min(...salePrices) : 0;
  const startingPriceLabel = minSale > 0
    ? `Commercial acquisitions starting from AED ${formatNumber(minSale)}. Reagle Advisory ${PRICING?.reagleAdvisory?.toLowerCase()}. Commercial leasing: ${PRICING?.commercialLeasing?.toLowerCase()}.`
    : `Reagle Advisory ${PRICING?.reagleAdvisory?.toLowerCase()}. Commercial leasing: ${PRICING?.commercialLeasing?.toLowerCase()}. Acquisitions priced on request.`;

  const webPage = generateWebPageSchema({
    name: 'Commercial Real Estate Dubai',
    description: 'Investment-grade commercial properties in Dubai: office, retail and mixed-use in DIFC and Business Bay.',
    url: `${siteUrl}/commercial`,
    type: 'CollectionPage',
  });
  const itemList = generateItemListSchema(
    'Commercial Properties in Dubai',
    `${siteUrl}/commercial`,
    listings?.map((l) => ({ name: l?.name, url: `${siteUrl}/properties/${l?.id}` }))
  );
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Commercial', url: `${siteUrl}/commercial` },
  ]);

  return (
    <>
      <JsonLd data={webPage} />
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumb} />
      <CommercialPageClient initialListings={listings} startingPriceLabel={startingPriceLabel} />
    </>
  );
}