import JsonLd from '@/components/JsonLd';
import CommercialPageClient from './CommercialPageClient';
import { fetchCommercialListings, formatNumber } from '@/lib/seo/serverData';
import { generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo/schemas';

export { metadata } from './metadata';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export default async function CommercialPage() {
  const listings = await fetchCommercialListings();

  // Indicative pricing: lowest published sale price, falling back to a fixed advisory fee.
  const salePrices = listings?.filter((l) => !l?.isRent && l?.priceRaw > 0)?.map((l) => l?.priceRaw);
  const minSale = salePrices?.length > 0 ? Math.min(...salePrices) : 0;
  const startingPriceLabel = minSale > 0
    ? `Commercial acquisitions starting from AED ${formatNumber(minSale)}. Advisory and leasing mandates from AED 15,000.`
    : 'Commercial advisory and leasing mandates starting from AED 15,000. Acquisitions priced on request.';

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
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumb} />
      <CommercialPageClient initialListings={listings} startingPriceLabel={startingPriceLabel} />
    </>
  );
}