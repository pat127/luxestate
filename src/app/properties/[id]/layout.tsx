import type { Metadata } from 'next';
import { generateMetadata as getMetadata } from './metadata';
import JsonLd from '@/components/JsonLd';
import { fetchPropertyById } from '@/lib/seo/serverData';
import { generateProductOfferSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return getMetadata({ params });
}

export default async function PropertyDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await fetchPropertyById(id);

  let schemas: React.ReactNode = null;
  if (property) {
    const images: string[] = Array.isArray(property.image_urls)
      ? property.image_urls
      : typeof property.image_urls === 'string' ? property.image_urls.split(',').map((u: string) => u.trim()).filter(Boolean)
        : [];
    const name: string = property.title || property.name || 'Property in Dubai';
    const isCommercial = ['Commercial', 'Office', 'Retail', 'Warehouse', 'Investment', 'Land'].includes(property.prop_category);
    const product = generateProductOfferSchema({
      id,
      name,
      description: property.description || undefined,
      image: images[0],
      price: Number(property.price_aed) || 0,
      location: property.location_area || undefined,
      available: !/sold|rented|off market/i.test(property.availability || ''),
    });
    const breadcrumb = generateBreadcrumbSchema([
      { name: 'Home', url: siteUrl },
      { name: isCommercial ? 'Commercial' : 'Residential', url: `${siteUrl}/${isCommercial ? 'commercial' : 'residential'}` },
      { name, url: `${siteUrl}/properties/${id}` },
    ]);
    schemas = (
      <>
        <JsonLd data={product} />
        <JsonLd data={breadcrumb} />
      </>
    );
  }

  return (
    <>
      {schemas}
      {children}
    </>
  );
}
