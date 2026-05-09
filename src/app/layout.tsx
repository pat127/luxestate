import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { CMSProvider } from '@/contexts/CMSContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxestate6357.builtwithrocket.new';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Cove Estates — Ultra-Premium Luxury Real Estate Dubai | Residential, Commercial & Off-Plan',
    template: '%s | Cove Estates Dubai',
  },
  description: 'Cove Estates curates Dubai\'s finest luxury residential and commercial properties for high-net-worth buyers. Explore exclusive villas, penthouses, off-plan projects, and commercial assets in prime Dubai locations.',
  keywords: [
    'luxury real estate Dubai',
    'premium properties Dubai',
    'off-plan projects Dubai',
    'Dubai villas for sale',
    'Dubai penthouses',
    'commercial property Dubai',
    'Dubai Marina apartments',
    'Palm Jumeirah villas',
    'Downtown Dubai properties',
    'luxury property investment Dubai',
    'DIFC commercial real estate',
    'Emirates Hills villas',
    'Dubai luxury homes',
    'high net worth real estate',
    'exclusive properties UAE',
  ],
  authors: [{ name: 'Cove Estates', url: siteUrl }],
  creator: 'Cove Estates',
  publisher: 'Cove Estates',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    url: siteUrl,
    siteName: 'Cove Estates',
    title: 'Cove Estates — Ultra-Premium Luxury Real Estate Dubai',
    description: 'Discover Dubai\'s most exclusive residential and commercial properties. Curated for high-net-worth buyers seeking prestige, exclusivity, and exceptional returns.',
    images: [
      {
        url: `${siteUrl}/assets/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Cove Estates — Luxury Real Estate Dubai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@coveestates',
    creator: '@coveestates',
    title: 'Cove Estates — Ultra-Premium Luxury Real Estate Dubai',
    description: 'Discover Dubai\'s most exclusive residential and commercial properties.',
    images: [`${siteUrl}/assets/images/og-image.jpg`],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-AE': siteUrl,
      'en-US': siteUrl,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
  category: 'real estate',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Cove Estates',
  description: 'Ultra-premium luxury real estate agency in Dubai specializing in residential, commercial, and off-plan properties.',
  url: siteUrl,
  logo: `${siteUrl}/assets/images/app_logo.png`,
  telephone: '+971508862683',
  email: 'admin@coveestates.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '8th Level, Moosa Tower 1',
    addressLocality: 'Dubai',
    addressCountry: 'AE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 25.2048,
    longitude: 55.2708,
  },
  areaServed: [
    { '@type': 'City', name: 'Dubai' },
    { '@type': 'City', name: 'Abu Dhabi' },
    { '@type': 'Country', name: 'United Arab Emirates' },
  ],
  sameAs: [
    'https://instagram.com/coveestates',
    'https://linkedin.com/company/coveestates',
    'https://facebook.com/coveestates',
  ],
  knowsAbout: [
    'Luxury Real Estate',
    'Dubai Property Market',
    'Off-Plan Investments',
    'Commercial Real Estate Dubai',
    'Residential Properties Dubai',
    'Property Investment UAE',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Cove Estates',
  url: siteUrl,
  description: 'Ultra-premium luxury real estate in Dubai',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/residential?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="geo.region" content="AE-DU" />
        <meta name="geo.placename" content="Dubai, United Arab Emirates" />
        <meta name="geo.position" content="25.2048;55.2708" />
        <meta name="ICBM" content="25.2048, 55.2708" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />
        <meta name="theme-color" content="#C9A84C" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fluxestate6357back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></head>
      <body className={plusJakartaSans.className}>
        <CMSProvider>
          <CurrencyProvider defaultCurrency="AED">
            {children}
          </CurrencyProvider>
        </CMSProvider>
      </body>
    </html>
  );
}