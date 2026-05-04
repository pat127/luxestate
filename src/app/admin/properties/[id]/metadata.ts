import type { Metadata } from 'next';

const propertyData: Record<string, any> = {
  '1': {
    name: 'Obsidian Penthouse',
    location: 'Downtown Dubai',
    community: 'Burj Khalifa District',
    price: 'AED 28,500,000',
    propertyType: 'Penthouse',
    beds: 5,
    baths: 6,
    sqft: '8,200',
    description: 'Discover this exceptional Obsidian Penthouse nestled in the heart of Downtown Dubai. This stunning property offers an unparalleled living experience with world-class amenities, breathtaking Burj Khalifa views, and meticulous attention to detail.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_15fed27fb-1772893766018.png',
  },
  '2': {
    name: 'Meridian Villa',
    location: 'Palm Jumeirah',
    community: 'Frond N',
    price: 'AED 42,000,000',
    propertyType: 'Villa',
    beds: 7,
    baths: 9,
    sqft: '14,500',
    description: 'An extraordinary beachfront villa on Palm Jumeirah offering unobstructed sea views and the ultimate in luxury living. This 7-bedroom masterpiece features a private beach, infinity pool, and world-class finishes throughout.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b9553347-1774335786277.png',
  },
};

export async function generatePropertyMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = propertyData[id] || propertyData['1'];

  const title = `${property.name} | ${property.propertyType} in ${property.location} | Cove Estates`;
  const description = `${property.beds ? `${property.beds} Bed ` : ''}${property.propertyType} in ${property.community}, ${property.location}. ${property.price}. ${property.sqft} sq ft. ${property.description.slice(0, 100)}...`;
  const url = `https://luxestate6357.builtwithrocket.new/admin/properties/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Cove Estates',
      images: [
        {
          url: property.image,
          width: 1200,
          height: 630,
          alt: `${property.name} - ${property.propertyType} in ${property.location}`,
        },
      ],
      type: 'website',
      locale: 'en_AE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [property.image],
    },
    alternates: {
      canonical: url,
    },
  };
}
