# SEO Optimization Guide — Listing Pages

## Overview

This guide documents the SEO optimizations implemented for Cove Estates listing pages (residential, commercial, and projects). The implementation includes:

- **Dynamic Meta Tags** — Category-specific titles, descriptions, and keywords
- **Structured Data (Schema.org)** — Property, Product, and CollectionPage schemas
- **Canonical URLs** — Per-category canonical URLs to prevent duplicate content
- **Open Graph Tags** — Social media preview optimization
- **Sitemap Enhancement** — Dynamic route support for properties and projects

---

## File Structure

### Core SEO Utilities

```
src/lib/seo/
├── metadata.ts          # Dynamic metadata generators
├── schemas.ts           # Structured data schema generators
├── canonical.ts         # Canonical URL utilities
└── og-tags.ts           # Open Graph tag generators
```

### Metadata Exports

```
src/app/
├── residential/metadata.ts
├── commercial/metadata.ts
└── projects/metadata.ts
```

### Components

```
src/components/
└── ListingSchemaRenderer.tsx  # Client component for rendering schemas
```

---

## Implementation Details

### 1. Dynamic Metadata for Listing Pages

#### Residential Listing Page

**File:** `src/app/residential/metadata.ts`

```typescript
export const metadata: Metadata = generateListingPageMetadata({
  category: 'residential',
  locale: 'en_AE',
});
```

**Generated Metadata:**
- **Title:** "Luxury Residential Properties Dubai | Villas, Penthouses & Apartments"
- **Description:** "Discover Dubai's most exclusive residential properties. Premium villas, penthouses, and apartments in Dubai Marina, Palm Jumeirah, Emirates Hills, and Downtown Dubai."
- **Canonical:** `https://luxestate6357.builtwithrocket.new/residential`
- **Keywords:** luxury villas Dubai, penthouses Dubai, apartments Dubai, residential properties, Dubai homes for sale

#### Commercial Listing Page

**File:** `src/app/commercial/metadata.ts`

```typescript
export const metadata: Metadata = generateListingPageMetadata({
  category: 'commercial',
  locale: 'en_AE',
});
```

**Generated Metadata:**
- **Title:** "Commercial Real Estate Dubai | Office, Retail & Investment Properties"
- **Description:** "Investment-grade commercial properties in Dubai. Office spaces, retail units, and mixed-use developments in DIFC, Business Bay, and prime commercial zones."
- **Canonical:** `https://luxestate6357.builtwithrocket.new/commercial`
- **Keywords:** commercial property Dubai, office space Dubai, retail Dubai, commercial real estate, Dubai business properties

#### Projects Listing Page

**File:** `src/app/projects/metadata.ts`

```typescript
export const metadata: Metadata = generateListingPageMetadata({
  category: 'projects',
  locale: 'en_AE',
});
```

**Generated Metadata:**
- **Title:** "Off-Plan Projects Dubai | New Developments & Investment Opportunities"
- **Description:** "Explore Dubai's most anticipated off-plan projects. New residential and commercial developments with flexible payment plans and investment potential."
- **Canonical:** `https://luxestate6357.builtwithrocket.new/projects`
- **Keywords:** off-plan projects Dubai, new developments Dubai, investment properties, Dubai construction, upcoming projects

---

### 2. Structured Data Implementation

#### CollectionPage Schema (Listing Pages)

Each listing page includes a `CollectionPage` schema that identifies it as a collection of properties:

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Residential Properties",
  "url": "https://luxestate6357.builtwithrocket.new/residential",
  "description": "Browse 0 residential properties in Dubai",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Residential Properties",
        "url": "https://luxestate6357.builtwithrocket.new/residential"
      }
    ]
  }
}
```

#### Property Schema (Individual Residential Listings)

For residential properties, use the `Property` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Property",
  "name": "Luxury Villa in Dubai Marina",
  "description": "Villa property in Dubai Marina",
  "url": "https://luxestate6357.builtwithrocket.new/properties/123",
  "image": "https://example.com/villa.jpg",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dubai Marina",
    "addressCountry": "AE"
  },
  "offers": {
    "@type": "Offer",
    "price": "2500000",
    "priceCurrency": "AED",
    "availability": "https://schema.org/InStock"
  },
  "numberOfRooms": 4,
  "numberOfBathroomsUnitConfiguration": 3,
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": "5000",
    "unitCode": "SQM"
  }
}
```

#### Product Schema (Commercial Properties)

For commercial properties, use the `Product` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Office Space in DIFC",
  "description": "Office property in DIFC",
  "url": "https://luxestate6357.builtwithrocket.new/properties/456",
  "image": "https://example.com/office.jpg",
  "offers": {
    "@type": "Offer",
    "price": "5000000",
    "priceCurrency": "AED",
    "availability": "https://schema.org/InStock",
    "url": "https://luxestate6357.builtwithrocket.new/properties/456"
  },
  "areaServed": {
    "@type": "City",
    "name": "DIFC"
  }
}
```

#### RealEstateAgent Schema (Projects)

For off-plan projects, use the `RealEstateAgent` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Luxury Waterfront Project",
  "description": "Luxury Waterfront Project by Developer",
  "url": "https://luxestate6357.builtwithrocket.new/projects/789",
  "image": "https://example.com/project.jpg",
  "areaServed": {
    "@type": "City",
    "name": "Dubai Marina"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dubai Marina",
    "addressCountry": "AE"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "AED",
    "lowPrice": "1500000",
    "offerCount": 250
  }
}
```

---

### 3. Canonical URLs

Canonical URLs are automatically generated per category to prevent duplicate content issues:

#### Listing Pages

- **Residential:** `https://luxestate6357.builtwithrocket.new/residential`
- **Commercial:** `https://luxestate6357.builtwithrocket.new/commercial`
- **Projects:** `https://luxestate6357.builtwithrocket.new/projects`

#### Individual Properties

- **Property:** `https://luxestate6357.builtwithrocket.new/properties/{id}`
- **Project:** `https://luxestate6357.builtwithrocket.new/projects/{id}`

#### Filtered Listings

- **Residential (filtered):** `https://luxestate6357.builtwithrocket.new/residential?type=Villa`
- **Commercial (filtered):** `https://luxestate6357.builtwithrocket.new/commercial?type=Office`

---

### 4. Open Graph Tags

Each listing page includes Open Graph tags for social media sharing:

```html
<meta property="og:title" content="Luxury Residential Properties Dubai | Villas, Penthouses & Apartments" />
<meta property="og:description" content="Discover Dubai's most exclusive residential properties..." />
<meta property="og:image" content="https://luxestate6357.builtwithrocket.new/assets/images/og-image.jpg" />
<meta property="og:url" content="https://luxestate6357.builtwithrocket.new/residential" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="en_AE" />
<meta property="og:site_name" content="Cove Estates" />
```

---

### 5. Sitemap Enhancement

The sitemap has been updated to include:

- **Static Routes:** All main listing pages with daily change frequency
- **Dynamic Routes:** Support for properties and projects (requires database integration)

**Current Priorities:**
- Homepage: 1.0
- Listing pages (residential, commercial, projects): 0.95
- About, International: 0.8, 0.7
- Legal pages: 0.5

**TODO:** Add dynamic property and project routes from the database.

---

## Usage Guide

### Using Metadata Generators

#### For Listing Pages

```typescript
import { generateListingPageMetadata } from '@/lib/seo/metadata';

export const metadata = generateListingPageMetadata({
  category: 'residential',
  locale: 'en_AE',
});
```

#### For Individual Properties

```typescript
import { generatePropertyMetadata } from '@/lib/seo/metadata';

export const metadata = generatePropertyMetadata({
  id: '123',
  name: 'Luxury Villa in Dubai Marina',
  location: 'Dubai Marina',
  price: 'AED 2,500,000',
  type: 'Villa',
  description: 'Stunning 4-bedroom villa with sea views...',
  image: 'https://example.com/villa.jpg',
  beds: 4,
  baths: 3,
  sqft: '5000',
  category: 'residential',
});
```

### Using Schema Generators

#### For Listing Collections

```typescript
import { generateListingCollectionSchema } from '@/lib/seo/schemas';

const schema = generateListingCollectionSchema({
  category: 'residential',
  count: 42,
  url: 'https://luxestate6357.builtwithrocket.new/residential',
});
```

#### For Individual Properties

```typescript
import { generatePropertySchema } from '@/lib/seo/schemas';

const schema = generatePropertySchema({
  id: '123',
  name: 'Luxury Villa',
  location: 'Dubai Marina',
  price: 'AED 2,500,000',
  type: 'Villa',
  beds: 4,
  baths: 3,
  sqft: '5000',
  status: 'Available',
});
```

### Using Canonical URL Utilities

```typescript
import {
  getListingCanonical,
  getPropertyCanonical,
  getProjectCanonical,
  getFilteredListingCanonical,
} from '@/lib/seo/canonical';

// Listing pages
const residentialCanonical = getListingCanonical('residential');
// → https://luxestate6357.builtwithrocket.new/residential

// Individual properties
const propertyCanonical = getPropertyCanonical('123');
// → https://luxestate6357.builtwithrocket.new/properties/123

// Filtered listings
const filteredCanonical = getFilteredListingCanonical('residential', 'Villa');
// → https://luxestate6357.builtwithrocket.new/residential?type=Villa
```

---

## SEO Best Practices

### 1. Meta Tags

✅ **Do:**
- Keep titles 30-60 characters
- Keep descriptions 140-160 characters
- Include primary keywords naturally
- Use category-specific titles and descriptions

❌ **Don't:**
- Duplicate titles across pages
- Keyword stuff
- Use generic titles

### 2. Structured Data

✅ **Do:**
- Use appropriate schema types (Property, Product, CollectionPage)
- Include all relevant properties (price, address, image, etc.)
- Validate schemas with Google's Rich Results Test
- Update schemas when property data changes

❌ **Don't:**
- Use incorrect schema types
- Leave required fields empty
- Include outdated information

### 3. Canonical URLs

✅ **Do:**
- Use canonical URLs on all listing pages
- Point to the primary version of each page
- Use absolute URLs (with protocol and domain)
- Keep canonicals consistent

❌ **Don't:**
- Use relative URLs
- Point to different domains
- Create circular canonical chains

### 4. Open Graph Tags

✅ **Do:**
- Include og:image (1200×630px recommended)
- Use descriptive og:title and og:description
- Include og:url and og:type
- Test with Facebook Sharing Debugger

❌ **Don't:**
- Use low-quality images
- Leave og:image empty
- Use misleading descriptions

---

## Testing & Validation

### Tools

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Validates structured data

2. **Google Search Console**
   - Monitor indexing status
   - Check for crawl errors
   - Review search performance

3. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Tests Open Graph tags

4. **Schema.org Validator**
   - URL: https://validator.schema.org/
   - Validates JSON-LD schemas

### Validation Checklist

- [ ] All listing pages have unique titles and descriptions
- [ ] Canonical URLs are present and correct
- [ ] Structured data validates without errors
- [ ] Open Graph images are 1200×630px
- [ ] All schemas include required properties
- [ ] Sitemap includes all public routes
- [ ] Robots.txt allows crawling of listing pages

---

## Future Enhancements

### 1. Dynamic Sitemap

Add database integration to automatically include:
- All published properties
- All active projects
- Last modified dates
- Change frequency per property type

### 2. Breadcrumb Navigation

Implement breadcrumb schema for:
- Home > Residential > Property Name
- Home > Commercial > Property Name
- Home > Projects > Project Name

### 3. FAQ Schema

Add FAQ sections to listing pages with:
- Common questions about property types
- Investment FAQs for commercial properties
- Payment plan FAQs for projects

### 4. Image SEO

Optimize images with:
- Descriptive alt text
- Proper file names
- WebP format with fallbacks
- Lazy loading

### 5. Local SEO

Enhance local search visibility:
- Location-specific landing pages
- Local schema markup
- Google My Business integration
- Location-based keywords

---

## Maintenance

### Regular Tasks

- **Weekly:** Monitor Google Search Console for errors
- **Monthly:** Review search performance metrics
- **Quarterly:** Audit and update metadata
- **Annually:** Review and update SEO strategy

### When to Update

- When property data changes
- When new properties are added
- When projects are completed
- When business information changes
- When new features are added

---

## Support & Questions

For questions about SEO implementation:
1. Check this documentation
2. Review the code comments
3. Test with validation tools
4. Consult SEO best practices

---

**Last Updated:** 2026-05-24
**Version:** 1.0
