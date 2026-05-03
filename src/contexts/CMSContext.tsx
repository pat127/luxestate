'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type PageKey = 'home' | 'residential' | 'commercial' | 'projects' | 'about' | 'blog' | 'contact';

export interface HomepageBlock {
  key: string;
  label: string;
  visible: boolean;
  order: number;
  editable?: boolean;
}

export interface PageConfig {
  key: PageKey;
  label: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_description: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  meta_title: string;
  meta_description: string;
  sections: Record<string, boolean>;
  homepage_blocks?: HomepageBlock[];
}

export interface BrandingConfig {
  company_name: string;
  tagline: string;
  primary_color: string;
  accent_color: string;
  font_family: string;
}

export interface CMSData {
  pages: PageConfig[];
  branding: BrandingConfig;
  lastSaved?: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  company_name: 'LuxEstate',
  tagline: 'Luxury Real Estate in Dubai',
  primary_color: '#C9A84C',
  accent_color: '#B8963E',
  font_family: 'Plus Jakarta Sans',
};

export const DEFAULT_HOMEPAGE_BLOCKS: HomepageBlock[] = [
  { key: 'featured_properties', label: 'Featured Properties', visible: true, order: 1, editable: true },
  { key: 'featured_projects', label: 'Featured Projects', visible: true, order: 2, editable: true },
  { key: 'why_luxestate', label: 'Why LuxEstate', visible: true, order: 3, editable: true },
  { key: 'testimonials', label: 'Testimonials', visible: true, order: 4, editable: true },
  { key: 'mortgage_calculator', label: 'Mortgage Calculator', visible: true, order: 5, editable: true },
  { key: 'contact_section', label: 'Contact Section', visible: true, order: 6, editable: true },
];

export const DEFAULT_PAGES: PageConfig[] = [
  {
    key: 'home',
    label: 'Home',
    hero_headline: 'Where Architecture Becomes Legacy',
    hero_subheadline: 'Ultra-premium properties for discerning buyers',
    hero_description: 'Exclusively curated residences, estates, and commercial assets for those who measure value in lifetimes, not years.',
    cta_primary_text: 'Explore Properties',
    cta_primary_link: '/residential',
    cta_secondary_text: 'Book Consultation',
    cta_secondary_link: '/#contact',
    meta_title: 'LuxEstate — Ultra-Premium Properties for Discerning Buyers',
    meta_description: 'LuxEstate curates the world\'s finest residential and commercial properties for high-net-worth buyers.',
    sections: { featured_properties: true, featured_projects: true, why_luxestate: true, testimonials: true, mortgage_calculator: true, contact_section: true },
    homepage_blocks: DEFAULT_HOMEPAGE_BLOCKS,
  },
  {
    key: 'residential',
    label: 'Residential',
    hero_headline: 'Private Residences Worth Living For',
    hero_subheadline: 'Villas, penthouses & luxury apartments in Dubai\'s finest locations',
    hero_description: 'Discover our curated portfolio of ultra-premium residential properties, from beachfront villas to sky-high penthouses.',
    cta_primary_text: 'View All Properties',
    cta_primary_link: '/residential#listings',
    cta_secondary_text: 'Book Viewing',
    cta_secondary_link: '/#contact',
    meta_title: 'Luxury Residential Properties Dubai — LuxEstate',
    meta_description: 'Browse exclusive villas, penthouses and luxury apartments in Dubai\'s most prestigious locations.',
    sections: { search_bar: true, listings_grid: true, team_section: true, market_stats: true },
  },
  {
    key: 'commercial',
    label: 'Commercial',
    hero_headline: 'Premium Commercial Real Estate',
    hero_subheadline: 'Office spaces, retail units & investment-grade commercial properties',
    hero_description: 'Strategic commercial properties in Dubai\'s most sought-after business districts, offering exceptional yields and capital appreciation.',
    cta_primary_text: 'View Commercial',
    cta_primary_link: '/commercial#listings',
    cta_secondary_text: 'Get Investment Report',
    cta_secondary_link: '/#contact',
    meta_title: 'Commercial Properties Dubai — LuxEstate',
    meta_description: 'Premium office spaces, retail units and investment-grade commercial properties in Dubai.',
    sections: { listings_grid: true, market_insights: true, commercial_stats: true },
  },
  {
    key: 'projects',
    label: 'Projects',
    hero_headline: 'Off-Plan & New Developments',
    hero_subheadline: 'Exclusive access to Dubai\'s most anticipated new projects',
    hero_description: 'Invest in tomorrow\'s landmarks today. Our off-plan portfolio features the most sought-after developments from Dubai\'s leading developers.',
    cta_primary_text: 'View Projects',
    cta_primary_link: '/projects#gallery',
    cta_secondary_text: 'Register Interest',
    cta_secondary_link: '/#contact',
    meta_title: 'Off-Plan Projects Dubai — LuxEstate',
    meta_description: 'Exclusive off-plan and new development projects in Dubai from leading developers.',
    sections: { projects_gallery: true, project_timeline: true, project_inquiry: true },
  },
  {
    key: 'about',
    label: 'About',
    hero_headline: 'Redefining Luxury Real Estate',
    hero_subheadline: 'A legacy of excellence in Dubai\'s premium property market',
    hero_description: 'LuxEstate was founded with a singular vision: to provide ultra-high-net-worth individuals with unparalleled access to the world\'s most exclusive properties.',
    cta_primary_text: 'Meet Our Team',
    cta_primary_link: '/about#team',
    cta_secondary_text: 'Our Story',
    cta_secondary_link: '/about#story',
    meta_title: 'About LuxEstate — Luxury Real Estate Dubai',
    meta_description: 'Learn about LuxEstate\'s mission, team and 15+ years of excellence in Dubai\'s luxury property market.',
    sections: { team_section: true, stats_section: true, awards_section: true, timeline_section: true },
  },
  {
    key: 'blog',
    label: 'Blog',
    hero_headline: 'Market Insights & News',
    hero_subheadline: 'Expert analysis on Dubai\'s luxury real estate market',
    hero_description: 'Stay informed with the latest market trends, investment insights, and property news from LuxEstate\'s expert team.',
    cta_primary_text: 'Read Latest',
    cta_primary_link: '/blog#latest',
    cta_secondary_text: 'Subscribe',
    cta_secondary_link: '/blog#subscribe',
    meta_title: 'Real Estate Blog & Market Insights — LuxEstate',
    meta_description: 'Expert analysis, market trends and property investment insights from LuxEstate.',
    sections: { featured_post: true, posts_grid: true, categories_filter: true, newsletter_signup: true },
  },
  {
    key: 'contact',
    label: 'Contact',
    hero_headline: 'Get in Touch',
    hero_subheadline: 'Our team of specialists is ready to assist you',
    hero_description: 'Whether you\'re buying, selling, or investing, our dedicated team provides personalised guidance every step of the way.',
    cta_primary_text: 'Send Message',
    cta_primary_link: '/contact#form',
    cta_secondary_text: 'WhatsApp Us',
    cta_secondary_link: 'https://wa.me/971508862683',
    meta_title: 'Contact LuxEstate — Luxury Real Estate Dubai',
    meta_description: 'Contact LuxEstate\'s team of luxury property specialists in Dubai.',
    sections: { contact_form: true, map_section: true, office_details: true, whatsapp_button: true },
  },
];

const CMS_STORAGE_KEY = 'luxestate_cms_data';

interface CMSContextValue {
  pages: PageConfig[];
  branding: BrandingConfig;
  getPage: (key: PageKey) => PageConfig;
  updatePage: (page: PageConfig) => void;
  updateBranding: (b: BrandingConfig) => void;
  saveAll: (pages: PageConfig[], branding: BrandingConfig) => void;
  lastSaved?: string;
}

const CMSContext = createContext<CMSContextValue>({
  pages: DEFAULT_PAGES,
  branding: DEFAULT_BRANDING,
  getPage: (key) => DEFAULT_PAGES.find((p) => p.key === key) || DEFAULT_PAGES[0],
  updatePage: () => {},
  updateBranding: () => {},
  saveAll: () => {},
});

export function CMSProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<PageConfig[]>(DEFAULT_PAGES);
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [lastSaved, setLastSaved] = useState<string | undefined>();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CMS_STORAGE_KEY);
      if (stored) {
        const data: CMSData = JSON.parse(stored);
        if (data.pages?.length) {
          // Merge homepage_blocks defaults for existing data that may not have them
          const merged = data.pages.map((p) => {
            if (p.key === 'home' && !p.homepage_blocks) {
              return { ...p, homepage_blocks: DEFAULT_HOMEPAGE_BLOCKS };
            }
            return p;
          });
          setPages(merged);
        }
        if (data.branding) setBranding(data.branding);
        if (data.lastSaved) setLastSaved(data.lastSaved);
      }
    } catch {
      // use defaults
    }
  }, []);

  const getPage = useCallback((key: PageKey): PageConfig => {
    return pages.find((p) => p.key === key) || DEFAULT_PAGES.find((p) => p.key === key) || DEFAULT_PAGES[0];
  }, [pages]);

  const updatePage = useCallback((updated: PageConfig) => {
    setPages((prev) => prev.map((p) => p.key === updated.key ? updated : p));
  }, []);

  const updateBranding = useCallback((b: BrandingConfig) => {
    setBranding(b);
  }, []);

  const saveAll = useCallback((newPages: PageConfig[], newBranding: BrandingConfig) => {
    const ts = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    setPages(newPages);
    setBranding(newBranding);
    setLastSaved(ts);
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify({ pages: newPages, branding: newBranding, lastSaved: ts }));
    } catch {
      // storage unavailable
    }
  }, []);

  return (
    <CMSContext.Provider value={{ pages, branding, getPage, updatePage, updateBranding, saveAll, lastSaved }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  return useContext(CMSContext);
}

export function useCMSPage(key: PageKey) {
  const { getPage } = useCMS();
  return getPage(key);
}
