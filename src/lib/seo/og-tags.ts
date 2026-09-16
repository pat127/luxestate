export interface OGTagsParams {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
}

export function generateOGTags(params: OGTagsParams) {
  return {
    'og:title': params.title,
    'og:description': params.description,
    'og:image': params.image,
    'og:url': params.url,
    'og:type': params.type || 'website',
    'og:locale': params.locale || 'en_AE',
    'og:site_name': 'Cove Estates',
  };
}

export function generateTwitterTags(params: OGTagsParams) {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': params.title,
    'twitter:description': params.description,
    'twitter:image': params.image,
    'twitter:site': '@coveestates',
    'twitter:creator': '@coveestates',
  };
}

export function generateCategoryOGTags(
  category: 'residential' | 'commercial' | 'projects',
  count: number
) {
  const categoryInfo = {
    residential: {
      title: 'Luxury Residential Properties Dubai',
      description: `Explore ${count} exclusive residential properties in Dubai's most prestigious locations.`,type: 'website' as const,
    },
    commercial: {
      title: 'Commercial Real Estate Dubai',
      description: `Discover ${count} investment-grade commercial properties in Dubai's prime business zones.`,
      type: 'website' as const,
    },
    projects: {
      title: 'Off-Plan Projects Dubai',
      description: `Browse ${count} upcoming off-plan projects with flexible payment plans and investment potential.`,
      type: 'website' as const,
    },
  };

  const info = categoryInfo[category];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

  return generateOGTags({
    title: info.title,
    description: info.description,
    image: `${siteUrl}/assets/images/og-image.jpg`,
    url: `${siteUrl}/${category}`,
    type: info.type,
    locale: 'en_AE',
  });
}
