# SEO Quick Reference

## Metadata Generators

### Listing Page Metadata

```typescript
import { generateListingPageMetadata } from '@/lib/seo/metadata';

// Residential
export const metadata = generateListingPageMetadata({
  category: 'residential',
  locale: 'en_AE',
});

// Commercial
export const metadata = generateListingPageMetadata({
  category: 'commercial',
  locale: 'en_AE',
});

// Projects
export const metadata = generateListingPageMetadata({
  category: 'projects',
  locale: 'en_AE',
});
```

### Property Metadata

```typescript
import { generatePropertyMetadata } from '@/lib/seo/metadata';

export const metadata = generatePropertyMetadata({
  id: '123',
  name: 'Luxury Villa in Dubai Marina',
  location: 'Dubai Marina',
  price: 'AED 2,500,000',
  type: 'Villa',
  description: 'Stunning 4-bedroom villa with sea views and private beach access.',
  image: 'https://example.com/villa.jpg',
  beds: 4,
  baths: 3,
  sqft: '5000',
  category: 'residential',
});
```

### Project Metadata

```typescript
import { generateProjectMetadata } from '@/lib/seo/metadata';

export const metadata = generateProjectMetadata({
  id: '456',
  name: 'Luxury Waterfront Project',
  location: 'Dubai Marina',
  price: 'From AED 1,500,000',
  type: 'Mixed-Use Development',
  description: 'Premium off-plan project with flexible payment plans.',
  image: 'https://example.com/project.jpg',
  category: 'project',
});
```

---

## Schema Generators

### CollectionPage Schema

```typescript
import { generateListingCollectionSchema } from '@/lib/seo/schemas';

const schema = generateListingCollectionSchema({
  category: 'residential',
  count: 42,
  url: 'https://luxestate6357.builtwithrocket.new/residential',
});

// Use in page
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  suppressHydrationWarning
/>
```

### Property Schema

```typescript
import { generatePropertySchema } from '@/lib/seo/schemas';

const schema = generatePropertySchema({
  id: '123',
  name: 'Luxury Villa in Dubai Marina',
  location: 'Dubai Marina',
  price: 'AED 2,500,000',
  type: 'Villa',
  description: 'Stunning 4-bedroom villa with sea views.',
  image: 'https://example.com/villa.jpg',
  beds: 4,
  baths: 3,
  sqft: '5000',
  status: 'Available',
  url: 'https://luxestate6357.builtwithrocket.new/properties/123',
});
```

### Commercial Property Schema

```typescript
import { generateCommercialPropertySchema } from '@/lib/seo/schemas';

const schema = generateCommercialPropertySchema({
  id: '456',
  name: 'Premium Office Space in DIFC',
  location: 'DIFC',
  price: 'AED 5,000,000',
  type: 'Office',
  description: 'Grade A office space with premium amenities.',
  image: 'https://example.com/office.jpg',
  status: 'Available',
  url: 'https://luxestate6357.builtwithrocket.new/properties/456',
});
```

### Project Schema

```typescript
import { generateProjectSchema } from '@/lib/seo/schemas';

const schema = generateProjectSchema({
  id: '789',
  name: 'Luxury Waterfront Project',
  developer: 'Premium Developers',
  location: 'Dubai Marina',
  description: 'Premium off-plan project with flexible payment plans.',
  image: 'https://example.com/project.jpg',
  priceFrom: 'AED 1,500,000',
  units: 250,
  completion: '2028',
  url: 'https://luxestate6357.builtwithrocket.new/projects/789',
});
```

### Breadcrumb Schema

```typescript
import { generateBreadcrumbSchema } from '@/lib/seo/schemas';

const schema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://luxestate6357.builtwithrocket.new' },
  { name: 'Residential', url: 'https://luxestate6357.builtwithrocket.new/residential' },
  { name: 'Luxury Villa in Dubai Marina', url: 'https://luxestate6357.builtwithrocket.new/properties/123' },
]);
```

### FAQ Schema

```typescript
import { generateFAQSchema } from '@/lib/seo/schemas';

const schema = generateFAQSchema([
  {
    question: 'What is the average price of villas in Dubai Marina?',
    answer: 'The average price of villas in Dubai Marina ranges from AED 2 million to AED 5 million, depending on size and location.',
  },
  {
    question: 'Are there payment plans available for off-plan projects?',
    answer: 'Yes, most off-plan projects offer flexible payment plans with options for 50/50, 60/40, or even 70/30 splits.',
  },
]);
```

---

## Canonical URL Utilities

### Basic Usage

```typescript
import {
  getListingCanonical,
  getPropertyCanonical,
  getProjectCanonical,
  getFilteredListingCanonical,
  normalizeCanonical,
  getCategoryFromPath,
} from '@/lib/seo/canonical';

// Listing pages
const residentialUrl = getListingCanonical('residential');
// → https://luxestate6357.builtwithrocket.new/residential

const commercialUrl = getListingCanonical('commercial');
// → https://luxestate6357.builtwithrocket.new/commercial

const projectsUrl = getListingCanonical('projects');
// → https://luxestate6357.builtwithrocket.new/projects

// Individual properties
const propertyUrl = getPropertyCanonical('123');
// → https://luxestate6357.builtwithrocket.new/properties/123

const projectUrl = getProjectCanonical('456');
// → https://luxestate6357.builtwithrocket.new/projects/456

// Filtered listings
const villaUrl = getFilteredListingCanonical('residential', 'Villa');
// → https://luxestate6357.builtwithrocket.new/residential?type=Villa

const officeUrl = getFilteredListingCanonical('commercial', 'Office');
// → https://luxestate6357.builtwithrocket.new/commercial?type=Office

// Normalize URLs
const normalized = normalizeCanonical('https://example.com/page/');
// → https://example.com/page

// Get category from path
const category = getCategoryFromPath('/residential/properties');
// → 'residential'
```

---

## Open Graph Tags

### Generate OG Tags

```typescript
import { generateOGTags, generateTwitterTags, generateCategoryOGTags } from '@/lib/seo/og-tags';

// Custom OG tags
const ogTags = generateOGTags({
  title: 'Luxury Villa in Dubai Marina',
  description: 'Stunning 4-bedroom villa with sea views.',
  image: 'https://example.com/villa.jpg',
  url: 'https://luxestate6357.builtwithrocket.new/properties/123',
  type: 'website',
  locale: 'en_AE',
});

// Twitter Card tags
const twitterTags = generateTwitterTags({
  title: 'Luxury Villa in Dubai Marina',
  description: 'Stunning 4-bedroom villa with sea views.',
  image: 'https://example.com/villa.jpg',
  url: 'https://luxestate6357.builtwithrocket.new/properties/123',
});

// Category-specific OG tags
const categoryOG = generateCategoryOGTags('residential', 42);
// Generates tags for "Explore 42 exclusive residential properties..."
```

---

## Component Usage

### ListingSchemaRenderer

```typescript
import ListingSchemaRenderer from '@/components/ListingSchemaRenderer';

// In your component
<ListingSchemaRenderer
  id="123"
  name="Luxury Villa in Dubai Marina"
  location="Dubai Marina"
  price="AED 2,500,000"
  type="Villa"
  description="Stunning 4-bedroom villa with sea views."
  image="https://example.com/villa.jpg"
  beds={4}
  baths={3}
  sqft="5000"
  status="Available"
  category="residential"
/>
```

---

## Common Patterns

### Pattern 1: Listing Page with Schema

```typescript
'use client';

import { generateListingCollectionSchema } from '@/lib/seo/schemas';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export default function ResidentialPage() {
  const schema = generateListingCollectionSchema({
    category: 'residential',
    count: 0,
    url: `${siteUrl}/residential`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        suppressHydrationWarning
      />
      {/* Page content */}
    </>
  );
}
```

### Pattern 2: Property Detail Page with Metadata

```typescript
import { generatePropertyMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }) {
  const property = await fetchProperty(params.id);

  return generatePropertyMetadata({
    id: property.id,
    name: property.name,
    location: property.location,
    price: property.price,
    type: property.type,
    description: property.description,
    image: property.image,
    beds: property.beds,
    baths: property.baths,
    sqft: property.sqft,
    category: 'residential',
  });
}
```

### Pattern 3: Dynamic Sitemap Entry

```typescript
// In sitemap.ts
const properties = await fetchProperties();
const propertyRoutes = properties.map(p => ({
  url: `${siteUrl}/properties/${p.id}`,
  lastModified: new Date(p.updated_at),
  changeFrequency: 'weekly' as const,
  priority: 0.8,
}));

return [...staticRoutes, ...propertyRoutes];
```

---

## Validation Commands

### Check Metadata

```bash
# View page source
curl -s https://luxestate6357.builtwithrocket.new/residential | grep -A 5 '<meta'

# Check canonical
curl -s https://luxestate6357.builtwithrocket.new/residential | grep canonical

# Check structured data
curl -s https://luxestate6357.builtwithrocket.new/residential | grep 'application/ld+json'
```

### Validate Schemas

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Paste your page URL

2. **Schema.org Validator**
   - URL: https://validator.schema.org/
   - Paste your JSON-LD

3. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Test OG tags

---

## Troubleshooting

### Issue: Metadata not showing

**Solution:**
- Ensure metadata export is in page.tsx or layout.tsx
- Check that metadataBase is set correctly
- Verify environment variables are loaded

### Issue: Schema not validating

**Solution:**
- Check all required fields are present
- Verify JSON-LD syntax
- Use schema.org validator
- Check for special characters

### Issue: Canonical URL conflicts

**Solution:**
- Ensure only one canonical per page
- Use absolute URLs
- Check for trailing slashes
- Verify domain is correct

### Issue: OG tags not showing on social media

**Solution:**
- Test with Facebook Sharing Debugger
- Ensure og:image is valid URL
- Check image dimensions (1200x630px)
- Clear cache and re-share

---

## Performance Tips

1. **Lazy load schemas** - Only render when needed
2. **Cache metadata** - Use Next.js caching
3. **Optimize images** - Use WebP with fallbacks
4. **Minimize JSON** - Remove unnecessary properties
5. **Use CDN** - Serve images from CDN

---

**Last Updated:** 2026-05-24
