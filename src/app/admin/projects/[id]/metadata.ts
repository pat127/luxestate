import type { Metadata } from 'next';

const projectData: Record<string, any> = {
  '1': {
    name: 'Skyline Residences',
    developer: 'Emaar',
    location: 'Downtown Dubai',
    community: 'Burj Khalifa District',
    price: 'AED 1.2M+',
    completion: 'Q4 2026',
    units: 240,
    sizeRange: '650 - 3,200 sq ft',
    description: 'Skyline Residences is a landmark development by Emaar in the heart of Downtown Dubai. Offering stunning views of the Burj Khalifa and Dubai Fountain, this iconic tower features meticulously designed residences with premium finishes and world-class amenities.',
    image: 'https://images.unsplash.com/photo-1614224352143-ef0bcc52828d'
  },
  '2': {
    name: 'Marina Bay Towers',
    developer: 'DAMAC',
    location: 'Dubai Marina',
    community: 'Marina Walk',
    price: 'AED 900K+',
    completion: 'Q2 2027',
    units: 320,
    sizeRange: '400 - 2,200 sq ft',
    description: 'Marina Bay Towers by DAMAC offers a premium waterfront lifestyle in Dubai Marina. With breathtaking marina views and direct access to the promenade, these residences redefine luxury living.',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_12d4ecc26-1772110246588.png"
  }
};

export async function generateProjectMetadata({ params }: {params: Promise<{id: string;}>;}): Promise<Metadata> {
  const { id } = await params;
  const project = projectData[id] || projectData['1'];

  const title = `${project.name} by ${project.developer} | Off-Plan in ${project.location} | Cove Estates`;
  const description = `${project.name} by ${project.developer} in ${project.community}, ${project.location}. Starting from ${project.price}. ${project.units} units, ${project.sizeRange}. Handover ${project.completion}. ${project.description.slice(0, 80)}...`;
  const url = `https://coveestate.com/admin/projects/${id}`;

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
        url: project.image,
        width: 1200,
        height: 630,
        alt: `${project.name} by ${project.developer} - Off-Plan Project in ${project.location}`
      }],

      type: 'website',
      locale: 'en_AE'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [project.image]
    },
    alternates: {
      canonical: url
    }
  };
}