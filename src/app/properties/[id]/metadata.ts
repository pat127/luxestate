import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  // Try to get property data from a server-safe approach
  const title = `Luxury Property | LuxEstate`;
  const description = `Explore this exclusive luxury property listing on LuxEstate — Dubai's premier real estate platform. Contact our team for pricing and availability.`;
  const ogImage = `${SITE_URL}/assets/images/app_logo.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/properties/${id}`,
      siteName: 'LuxEstate',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'LuxEstate Property' }],
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
