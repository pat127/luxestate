import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export interface ListingPageMetadataParams {
  category: 'residential' | 'commercial' | 'projects';
  locale?: string;
}

export interface PropertyMetadataParams {
  id: string;
  name: string;
  location: string;
  price: string;
  type: string;
  description?: string;
  image?: string;
  beds?: number;
  baths?: number;
  sqft?: string;
  category: 'residential' | 'commercial' | 'project';
}

const categoryMetadata = {
  residential: {
    title: 'Luxury Residential Properties Dubai | Villas, Penthouses & Apartments',
    description: 'Discover Dubai\'s most exclusive residential properties. Premium villas, penthouses, and apartments in Dubai Marina, Palm Jumeirah, Emirates Hills, and Downtown Dubai.',
    keywords: ['luxury villas Dubai', 'penthouses Dubai', 'apartments Dubai', 'residential properties', 'Dubai homes for sale'],
  },
  commercial: {
    title: 'Commercial Real Estate Dubai | Office, Retail & Investment Properties',
    description: 'Investment-grade commercial properties in Dubai. Office spaces, retail units, and mixed-use developments in DIFC, Business Bay, and prime commercial zones.',
    keywords: ['commercial property Dubai', 'office space Dubai', 'retail Dubai', 'commercial real estate', 'Dubai business properties'],
  },
  projects: {
    title: 'Off-Plan Projects Dubai | New Developments & Investment Opportunities',
    description: 'Explore Dubai\'s most anticipated off-plan projects. New residential and commercial developments with flexible payment plans and investment potential.',
    keywords: ['off-plan projects Dubai', 'new developments Dubai', 'investment properties', 'Dubai construction', 'upcoming projects'],
  },
};

export function generateListingPageMetadata(params: ListingPageMetadataParams): Metadata {
  const meta = categoryMetadata[params.category];
  const canonical = `${siteUrl}/${params.category}`;

  return {
    metadataBase: new URL(siteUrl),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      locale: params.locale || 'en_AE',
      url: canonical,
      title: meta.title,
      description: meta.description,
      siteName: 'Cove Estates',
      images: [
        {
          url: `${siteUrl}/assets/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: `${params.category.charAt(0).toUpperCase() + params.category.slice(1)} Properties - Cove Estates`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [`${siteUrl}/assets/images/og-image.jpg`],
    },
  };
}

export function generatePropertyMetadata(params: PropertyMetadataParams): Metadata {
  const title = `${params.name} in ${params.location} | ${params.price} | Cove Estates`;
  const description = params.description
    ? params.description.substring(0, 160)
    : `${params.type} property in ${params.location}. Price: ${params.price}. ${params.beds ? `${params.beds} beds, ` : ''}${params.baths ? `${params.baths} baths, ` : ''}${params.sqft ? `${params.sqft} sqft` : ''}`;

  const canonical = `${siteUrl}/properties/${params.id}`;
  const ogImage = params.image || `${siteUrl}/assets/images/og-image.jpg`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      locale: 'en_AE',
      url: canonical,
      title: `${params.name} | ${params.price}`,
      description,
      siteName: 'Cove Estates',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: params.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${params.name} | ${params.price}`,
      description,
      images: [ogImage],
    },
  };
}

export function generateProjectMetadata(params: PropertyMetadataParams): Metadata {
  const title = `${params.name} Off-Plan Project | ${params.price} | Cove Estates Dubai`;
  const description = params.description
    ? params.description.substring(0, 160)
    : `${params.type} project in ${params.location}. Starting from ${params.price}. Flexible payment plans and investment opportunities.`;

  const canonical = `${siteUrl}/projects/${params.id}`;
  const ogImage = params.image || `${siteUrl}/assets/images/og-image.jpg`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      locale: 'en_AE',
      url: canonical,
      title: `${params.name} | From ${params.price}`,
      description,
      siteName: 'Cove Estates',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: params.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${params.name} | From ${params.price}`,
      description,
      images: [ogImage],
    },
  };
}
