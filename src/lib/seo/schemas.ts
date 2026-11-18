import { BLOG_AUTHOR } from './author';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export interface PropertySchemaParams {
  id: string;
  name: string;
  description?: string;
  price: string;
  location: string;
  image?: string;
  beds?: number;
  baths?: number;
  sqft?: string;
  type: string;
  status?: string;
  url?: string;
}

export interface ProjectSchemaParams {
  id: string;
  name: string;
  description?: string;
  developer: string;
  location: string;
  image?: string;
  priceFrom: string;
  units: number;
  completion?: string;
  url?: string;
}

export interface ListingCollectionSchemaParams {
  category: 'residential' | 'commercial' | 'projects';
  count: number;
  url: string;
}

export function generatePropertySchema(params: PropertySchemaParams) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Property',
    name: params.name,
    description: params.description || `${params.type} property in ${params.location}`,
    url: params.url || `${siteUrl}/properties/${params.id}`,
    image: params.image || `${siteUrl}/assets/images/og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: params.location,
      addressCountry: 'AE',
    },
    offers: {
      '@type': 'Offer',
      price: params.price.replace(/[^0-9]/g, ''),
      priceCurrency: 'AED',
      availability: params.status === 'Available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  if (params.beds !== undefined || params.baths !== undefined || params.sqft) {
    Object.assign(schema, {
      numberOfRooms: params.beds || undefined,
      numberOfBathroomsUnitConfiguration: params.baths || undefined,
      floorSize: params.sqft ? { '@type': 'QuantitativeValue', value: params.sqft, unitCode: 'SQM' } : undefined,
    });
  }

  return schema;
}

export function generateCommercialPropertySchema(params: PropertySchemaParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description || `${params.type} property in ${params.location}`,
    url: params.url || `${siteUrl}/properties/${params.id}`,
    image: params.image || `${siteUrl}/assets/images/og-image.jpg`,
    offers: {
      '@type': 'Offer',
      price: params.price.replace(/[^0-9]/g, ''),
      priceCurrency: 'AED',
      availability: params.status === 'Available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: params.url || `${siteUrl}/properties/${params.id}`,
    },
    areaServed: {
      '@type': 'City',
      name: params.location,
    },
  };
}

export function generateProjectSchema(params: ProjectSchemaParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: params.name,
    description: params.description || `${params.name} by ${params.developer}`,
    url: params.url || `${siteUrl}/projects/${params.id}`,
    image: params.image || `${siteUrl}/assets/images/og-image.jpg`,
    areaServed: {
      '@type': 'City',
      name: params.location,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: params.location,
      addressCountry: 'AE',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'AED',
      lowPrice: params.priceFrom.replace(/[^0-9]/g, ''),
      offerCount: params.units,
    },
  };
}

export function generateListingCollectionSchema(params: ListingCollectionSchemaParams) {
  const categoryNames = {
    residential: 'Residential Properties',
    commercial: 'Commercial Properties',
    projects: 'Off-Plan Projects',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryNames[params.category],
    url: params.url,
    description: `Browse ${params.count} ${categoryNames[params.category].toLowerCase()} in Dubai`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: categoryNames[params.category],
          url: params.url,
        },
      ],
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema(params: {
  title: string;
  description?: string;
  slug: string;
  image?: string;
  author?: string;
  authorUrl?: string;
  datePublished: string;
  dateModified?: string;
  category?: string;
}) {
  const url = `${siteUrl}/blog/${params.slug}`;
  const authorName = BLOG_AUTHOR.name;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description || undefined,
    image: params.image ? [params.image] : [`${siteUrl}/assets/images/og-image.jpg`],
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    articleSection: params.category || undefined,
    inLanguage: 'en',
    author: {
      '@type': 'Person',
      name: authorName,
      jobTitle: BLOG_AUTHOR.title,
      description: BLOG_AUTHOR.bio,
      url: params.authorUrl || BLOG_AUTHOR.url,
      sameAs: [...BLOG_AUTHOR.sameAs],
      worksFor: { '@type': 'Organization', name: 'Cove Estates', url: siteUrl },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cove Estates',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/assets/images/app_logo.png` },
    },
  };
}

export function generateWebPageSchema(params: {
  name: string;
  description?: string;
  url: string;
  type?: 'WebPage' | 'CollectionPage' | 'FAQPage' | 'AboutPage' | 'ContactPage';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': params.type || 'WebPage',
    name: params.name,
    description: params.description,
    url: params.url,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'Cove Estates', url: siteUrl },
    about: { '@type': 'Organization', name: 'Cove Estates', url: siteUrl },
  };
}

export function generateProductOfferSchema(params: {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  location?: string;
  available?: boolean;
}) {
  const url = `${siteUrl}/properties/${params.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description || `${params.name}${params.location ? ` in ${params.location}` : ''}`,
    image: params.image ? [params.image] : [`${siteUrl}/assets/images/og-image.jpg`],
    url,
    brand: { '@type': 'Brand', name: 'Cove Estates' },
    offers: {
      '@type': 'Offer',
      url,
      price: params.price > 0 ? String(params.price) : undefined,
      priceCurrency: 'AED',
      availability: params.available === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: { '@type': 'RealEstateAgent', name: 'Cove Estates' },
    },
  };
}

export function generateItemListSchema(
  name: string,
  url: string,
  items: Array<{ name: string; url: string; image?: string; price?: number }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: it.url,
      name: it.name,
    })),
  };
}

export function generateRealEstateAgentSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Cove Estates',
    url: siteUrl,
    logo: `${siteUrl}/assets/images/app_logo.png`,
    image: `${siteUrl}/assets/images/og-image.jpg`,
    telephone: '+971508862683',
    email: 'admin@coveestates.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '8th Level, Moosa Tower 1',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
  };
}
