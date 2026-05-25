import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

export async function generatePropertyMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('title, location_area, community, price_aed, property_type, bedrooms, bathrooms, area_sqft, description, image_urls')
    .eq('id', id)
    .single();

  if (!property) {
    return {
      title: 'Property | Cove Estates',
      description: 'View property details on Cove Estates.',
    };
  }

  const name = property.title || 'Property';
  const location = property.location_area || '';
  const community = property.community || '';
  const propertyType = property.property_type || 'Property';
  const price = property.price_aed ? `AED ${Number(property.price_aed).toLocaleString()}` : '';
  const beds = property.bedrooms || 0;
  const baths = property.bathrooms || 0;
  const sqft = property.area_sqft ? Number(property.area_sqft).toLocaleString() : '';
  const desc = property.description || '';
  const image = Array.isArray(property.image_urls) && property.image_urls.length > 0 ? property.image_urls[0] : '';

  const title = `${name} | ${propertyType} in ${location} | Cove Estates`;
  const description = `${beds ? `${beds} Bed ` : ''}${propertyType} in ${community}${community && location ? ', ' : ''}${location}. ${price}. ${sqft} sq ft. ${desc.slice(0, 100)}...`;
  const url = `https://coveestate.com/admin/properties/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Cove Estates',
      ...(image ? {
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: `${name} - ${propertyType} in ${location}`,
          },
        ],
      } : {}),
      type: 'website',
      locale: 'en_AE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    alternates: {
      canonical: url,
    },
  };
}
