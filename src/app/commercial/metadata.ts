import type { Metadata } from 'next';
import { generateListingPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateListingPageMetadata({
  category: 'commercial',
  locale: 'en_AE',
});
