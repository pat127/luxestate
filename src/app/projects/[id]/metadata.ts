import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  const title = `Luxury Off-Plan Project | LuxEstate`;
  const description = `Discover this exclusive off-plan development on LuxEstate — Dubai's premier real estate platform. Explore floor plans, payment plans, and investment opportunities.`;
  const ogImage = `${SITE_URL}/assets/images/app_logo.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/projects/${id}`,
      siteName: 'LuxEstate',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'LuxEstate Project' }],
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
      canonical: `${SITE_URL}/projects/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
