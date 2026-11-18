import type { Metadata } from 'next';
import { fetchPropertyById } from '@/lib/seo/serverData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveestate.com';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await fetchPropertyById(id);

  const name: string | undefined = property?.title || property?.name;
  const title = name ? `${name}${property?.location_area ? ` — ${property.location_area}` : ''}` : 'Luxury Property in Dubai';
  const description =
    (property?.description && String(property.description).slice(0, 155)) ||
    `Explore this exclusive property listing from Cove Estates — Dubai's premier real estate advisory. Contact our team for pricing and availability.`;
  const images: string[] = Array.isArray(property?.image_urls)
    ? property.image_urls
    : typeof property?.image_urls === 'string' ? property.image_urls.split(',').map((u: string) => u.trim()).filter(Boolean)
      : [];
  const ogImage = images[0] || `${SITE_URL}/assets/images/app_logo.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/properties/${id}`,
      siteName: 'Cove Estates',
      images: [{ url: ogImage, width: 1200, height: 630, alt: name || 'Cove Estates Property' }],
      type: 'website',
      locale: 'en_AE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${SITE_URL}/properties/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
