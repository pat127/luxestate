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
