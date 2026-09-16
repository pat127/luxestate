'use client';

import React from 'react';
import { generatePropertySchema, generateCommercialPropertySchema } from '@/lib/seo/schemas';

interface ListingSchemaRendererProps {
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
  status?: string;
  category: 'residential' | 'commercial';
}

export default function ListingSchemaRenderer({
  id,
  name,
  location,
  price,
  type,
  description,
  image,
  beds,
  baths,
  sqft,
  status,
  category,
}: ListingSchemaRendererProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

  const schema =
    category === 'residential'
      ? generatePropertySchema({
          id,
          name,
          location,
          price,
          type,
          description,
          image,
          beds,
          baths,
          sqft,
          status,
          url: `${siteUrl}/properties/${id}`,
        })
      : generateCommercialPropertySchema({
          id,
          name,
          location,
          price,
          type,
          description,
          image,
          status,
          url: `${siteUrl}/properties/${id}`,
        });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      suppressHydrationWarning
    />
  );
}
