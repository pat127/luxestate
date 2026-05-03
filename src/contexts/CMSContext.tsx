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
  hero_image?: string;
  hero_eyebrow?: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  meta_title: string;
  meta_description: string;
  sections: Record<string, boolean>;
  homepage_blocks?: HomepageBlock[];
  // Block-level content
  hero_stats?: HeroStat[];
  featured_properties_content?: FeaturedPropertiesContent;
  featured_projects_content?: FeaturedProjectsContent;
  why_luxestate_content?: WhyLuxEstateContent;
  testimonials_content?: TestimonialsContent;
  contact_content?: ContactContent;
  mortgage_content?: MortgageContent;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface PropertyItem {
  id: number;
  name: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  tag: string;
  href: string;
  image: string;
  alt: string;
}

export interface FeaturedPropertiesContent {
  eyebrow: string;
  headline: string;
  headline_shimmer: string;
  description: string;
  cta_text: string;
  cta_link: string;
  properties: PropertyItem[];
}

export interface ProjectItem {
  id: number;
  name: string;
  developer: string;
  location: string;
  type: string;
  completion: string;
  price: string;
  units: number;
  sold: number;
  image: string;
  alt: string;
  tag: string;
}

export interface FeaturedProjectsContent {
  eyebrow: string;
  headline: string;
  headline_shimmer: string;
  description: string;
  cta_text: string;
  cta_link: string;
  projects: ProjectItem[];
}

export interface WhyStep {
  id: string;
  number: string;
  title: string;
  description: string;
  badge: string;
  image: string;
  imageAlt: string;
}

export interface WhyLuxEstateContent {
  eyebrow: string;
  headline: string;
  headline_shimmer: string;
  subtext: string;
  left_title: string;
  left_subtitle: string;
  steps: WhyStep[];
  cta_text: string;
  cta_link: string;
}

export interface TestimonialItem {
  name: string;
  location: string;
  quote: string;
  role: string;
  image: string;
  imageAlt: string;
  isCenter?: boolean;
}

export interface AwardItem {
  title: string;
  category: string;
  year: string;
}

export interface TestimonialsContent {
  eyebrow: string;
  headline: string;
  headline_shimmer: string;
  awards_eyebrow: string;
  awards_headline: string;
  awards_headline_shimmer: string;
  awards_subtext: string;
  testimonials: TestimonialItem[];
  awards: AwardItem[];
}

export interface ContactDetail {
  icon: string;
  label: string;
  value: string;
}

export interface ContactContent {
  eyebrow: string;
  headline: string;
  headline_shimmer: string;
  description: string;
  availability_text: string;
  availability_subtext: string;
  details: ContactDetail[];
}

export interface MortgageContent {
  eyebrow: string;
  headline: string;
  description: string;
  cta_text: string;
  cta_link: string;
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
  font_family: 'Plus Jakarta Sans'
};

export const DEFAULT_HOMEPAGE_BLOCKS: HomepageBlock[] = [
{ key: 'featured_properties', label: 'Featured Properties', visible: true, order: 1, editable: true },
{ key: 'featured_projects', label: 'Featured Projects', visible: true, order: 2, editable: true },
{ key: 'why_luxestate', label: 'Why LuxEstate', visible: true, order: 3, editable: true },
{ key: 'testimonials', label: 'Testimonials', visible: true, order: 4, editable: true },
{ key: 'mortgage_calculator', label: 'Mortgage Calculator', visible: true, order: 5, editable: true },
{ key: 'contact_section', label: 'Contact Section', visible: true, order: 6, editable: true }];


export const DEFAULT_HERO_STATS: HeroStat[] = [
{ value: '18+', label: 'Years Experience' },
{ value: '$4.2B', label: 'Portfolio Value' },
{ value: '340+', label: 'Properties Sold' },
{ value: '98%', label: 'Client Satisfaction' }];


export const DEFAULT_FEATURED_PROPERTIES: FeaturedPropertiesContent = {
  eyebrow: 'Curated Selection',
  headline: 'Featured',
  headline_shimmer: 'Properties',
  description: 'Each property is personally vetted by our principals for architectural distinction and investment merit.',
  cta_text: 'View All Properties',
  cta_link: '/residential',
  properties: [
  { id: 1, name: 'Obsidian Penthouse', location: 'Manhattan, New York', price: '$28,500,000', beds: 5, baths: 6, sqft: '8,200', tag: 'Penthouse', href: '/residential', image: "https://img.rocket.new/generatedImages/rocket_gen_img_14bda165d-1772198562370.png", alt: 'Ultra-modern penthouse living room, floor-to-ceiling windows, Manhattan skyline at night' },
  { id: 2, name: 'Meridian Villa', location: 'Beverly Hills, CA', price: '$42,000,000', beds: 7, baths: 9, sqft: '14,500', tag: 'Villa', href: '/residential', image: "https://img.rocket.new/generatedImages/rocket_gen_img_177c45a3d-1772197748060.png", alt: 'Contemporary Beverly Hills villa exterior at dusk, dramatic cantilever architecture' },
  { id: 3, name: 'The Whitmore', location: 'Tribeca, New York', price: '$9,800,000', beds: 3, baths: 3, sqft: '3,600', tag: 'Townhouse', href: '/residential', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d1ee6f9a-1772996729777.png", alt: 'Luxury Tribeca townhouse facade, dark brick and steel' },
  { id: 4, name: 'Atlas Loft', location: 'Chicago, IL', price: '$6,200,000', beds: 2, baths: 2, sqft: '2,800', tag: 'Loft', href: '/residential', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1463039ae-1772202574460.png", alt: 'Industrial luxury loft interior, exposed concrete ceiling, Chicago skyline' },
  { id: 5, name: 'Vantage Estate', location: 'Malibu, CA', price: '$65,000,000', beds: 9, baths: 11, sqft: '22,000', tag: 'Estate', href: '/residential', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d77ade9b-1773162376685.png", alt: 'Sprawling Malibu oceanfront estate, dramatic cliffside setting' },
  { id: 6, name: 'The Crescent', location: 'Miami Beach, FL', price: '$18,500,000', beds: 4, baths: 5, sqft: '6,400', tag: 'Residence', href: '/residential', image: "https://images.unsplash.com/photo-1726808856053-88a76debd4e1", alt: 'Miami Beach luxury residence, white geometric facade' }]

};

export const DEFAULT_FEATURED_PROJECTS: FeaturedProjectsContent = {
  eyebrow: 'Off-Plan & New Developments',
  headline: 'Featured',
  headline_shimmer: 'Projects',
  description: "Exclusive off-plan developments and new launches from Dubai's most prestigious developers.",
  cta_text: 'View All Projects',
  cta_link: '/projects',
  projects: [
  { id: 1, name: 'Skyline Residences', developer: 'Emaar', location: 'Downtown Dubai', type: 'Off-Plan', completion: 'Q4 2026', price: 'AED 1.2M+', units: 240, sold: 75, image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1006417f3-1772199921046.png', alt: 'Modern residential tower in Downtown Dubai at dusk, glass facade, dramatic lighting', tag: 'Selling Fast' },
  { id: 2, name: 'Marina Bay Towers', developer: 'DAMAC', location: 'Dubai Marina', type: 'Off-Plan', completion: 'Q2 2027', price: 'AED 900K+', units: 320, sold: 65, image: 'https://images.unsplash.com/photo-1735561650147-27d4d3e1002c', alt: 'Twin towers rising over Dubai Marina waterfront, golden hour reflections on glass', tag: 'New Launch' },
  { id: 3, name: 'Creek Horizon', developer: 'Meraas', location: 'Dubai Creek', type: 'Off-Plan', completion: 'Q3 2028', price: 'AED 1.8M+', units: 180, sold: 0, image: "https://img.rocket.new/generatedImages/rocket_gen_img_10e7e337d-1772064904447.png", alt: 'Luxury waterfront development along Dubai Creek, contemporary architecture', tag: 'Launching Soon' }]

};

export const DEFAULT_WHY_LUXESTATE: WhyLuxEstateContent = {
  eyebrow: 'The LuxEstate Difference',
  headline: 'How We',
  headline_shimmer: 'Deliver',
  subtext: 'Three decades of combined expertise, an unmatched off-market network, and a singular obsession with client outcomes.',
  left_title: 'How The',
  left_subtitle: 'Process Works',
  cta_text: 'Begin Your Search',
  cta_link: '#contact',
  steps: [
  { id: '1', number: '01', title: 'Curated Discovery', description: 'We begin with a confidential consultation to understand your vision — lifestyle requirements, investment objectives, and the architectural character that resonates with you. No mass listings. Only properties that match your precise criteria.', badge: 'Bespoke Matching', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c136d863-1766818210862.png", imageAlt: 'Luxury real estate consultation, dark mahogany desk, architectural blueprints' },
  { id: '2', number: '02', title: 'Private Access', description: 'Seventy percent of our portfolio never reaches the open market. Through 18 years of relationships with developers, estate families, and institutional owners, we unlock properties before they are ever listed publicly.', badge: 'Off-Market Network', image: "https://img.rocket.new/generatedImages/rocket_gen_img_10466e713-1772203436672.png", imageAlt: 'Exclusive private estate driveway at dusk, iron gates, dramatic architectural lighting' },
  { id: '3', number: '03', title: 'White-Glove Acquisition', description: 'From due diligence and negotiation to legal structuring and post-purchase management, we orchestrate every dimension of the transaction. Our clients close with certainty, not uncertainty.', badge: 'Full Service', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1faf1fcce-1772783285186.png", imageAlt: 'Luxury office interior, dark walls, gold accents, architectural details' }]

};

export const DEFAULT_TESTIMONIALS: TestimonialsContent = {
  eyebrow: 'Client Voices',
  headline: 'Trusted by Those Who Demand the',
  headline_shimmer: 'Best',
  awards_eyebrow: 'Recognition',
  awards_headline: 'Industry Validated',
  awards_headline_shimmer: 'Excellence',
  awards_subtext: "Our commitment to discretion and results has been recognized by the world's foremost luxury publications.",
  testimonials: [
  { name: 'Margaret Harrington', location: 'Greenwich, Connecticut', quote: "LuxEstate found us a property that wasn't on any public listing. The discretion and access they provide is unlike anything we've experienced in twenty years of property ownership.", role: 'Private Equity Principal', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b32bbd93-1763299584368.png', imageAlt: 'Professional woman in elegant dark blazer, studio portrait' },
  { name: 'Thomas Blackwell', location: 'Upper East Side, New York', quote: 'The caliber of off-market opportunities they surfaced was extraordinary.', role: 'Investment Banker', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1bfef8bd5-1763295388609.png', imageAlt: 'Professional man in tailored dark suit, confident expression, studio portrait' },
  { name: 'Priya Mehta', location: 'Beverly Hills, California', quote: "From first consultation to keys in hand — LuxEstate handled every detail with precision I've only ever seen in the most elite service firms.", role: 'Technology Entrepreneur', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_135fed5ac-1772395890088.png', imageAlt: 'Professional woman with elegant styling, warm smile, portrait', isCenter: true },
  { name: 'James Whitfield', location: 'Palm Beach, Florida', quote: 'Truly exceptional service.', role: 'Family Office Director', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1651cfc0b-1763295052209.png', imageAlt: 'Professional man in dark jacket, confident posture, studio portrait' },
  { name: 'Catherine Novak', location: 'Miami, Florida', quote: 'The network is unmatched.', role: 'Art Collector', image: 'https://images.unsplash.com/photo-1636200063467-5408d3d08473', imageAlt: 'Stylish woman in dark outfit, professional portrait' }],

  awards: [
  { title: 'Forbes Global Properties', category: 'Top 10 Luxury Brokerages', year: '2025' },
  { title: 'Wall Street Journal', category: 'Real Estate Excellence Award', year: '2024' },
  { title: 'Architectural Digest', category: 'Best in Design-Forward Sales', year: '2023' },
  { title: 'Robb Report', category: 'Luxury Real Estate Innovator', year: '2022' }]

};

export const DEFAULT_CONTACT: ContactContent = {
  eyebrow: 'Private Consultation',
  headline: 'Begin Your',
  headline_shimmer: 'Journey',
  description: 'Every exceptional acquisition begins with a conversation. Share your vision, and our principals will personally respond within 24 hours.',
  availability_text: 'Currently Accepting New Clients',
  availability_subtext: 'We work with a limited number of clients per quarter to ensure every acquisition receives our full attention and expertise.',
  details: [
  { icon: 'PhoneIcon', label: 'Direct Line', value: '+1 (212) 555-0190' },
  { icon: 'EnvelopeIcon', label: 'Private Email', value: 'acquisitions@luxestate.com' },
  { icon: 'MapPinIcon', label: 'Headquarters', value: '432 Park Avenue, New York, NY 10022' }]

};

export const DEFAULT_MORTGAGE: MortgageContent = {
  eyebrow: 'Financial Planning',
  headline: 'Mortgage\nCalculator',
  description: 'Estimate your monthly payments and understand the full financial picture before you commit.',
  cta_text: 'Speak with a Financial Advisor',
  cta_link: '#contact'
};

export const DEFAULT_PAGES: PageConfig[] = [
{
  key: 'home',
  label: 'Home',
  hero_headline: 'Where Architecture Becomes Legacy',
  hero_subheadline: 'Ultra-premium properties for discerning buyers',
  hero_description: 'Exclusively curated residences, estates, and commercial assets for those who measure value in lifetimes, not years.',
  hero_image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f930205d-1764676806048.png",
  hero_eyebrow: 'Curated Luxury Properties',
  cta_primary_text: 'Explore Properties',
  cta_primary_link: '/residential',
  cta_secondary_text: 'Book Consultation',
  cta_secondary_link: '/#contact',
  meta_title: 'LuxEstate — Ultra-Premium Properties for Discerning Buyers',
  meta_description: "LuxEstate curates the world's finest residential and commercial properties for high-net-worth buyers.",
  sections: { featured_properties: true, featured_projects: true, why_luxestate: true, testimonials: true, mortgage_calculator: true, contact_section: true },
  homepage_blocks: DEFAULT_HOMEPAGE_BLOCKS,
  hero_stats: DEFAULT_HERO_STATS,
  featured_properties_content: DEFAULT_FEATURED_PROPERTIES,
  featured_projects_content: DEFAULT_FEATURED_PROJECTS,
  why_luxestate_content: DEFAULT_WHY_LUXESTATE,
  testimonials_content: DEFAULT_TESTIMONIALS,
  contact_content: DEFAULT_CONTACT,
  mortgage_content: DEFAULT_MORTGAGE
},
{
  key: 'residential',
  label: 'Residential',
  hero_headline: 'Private Residences Worth Living For',
  hero_subheadline: "Villas, penthouses & luxury apartments in Dubai's finest locations",
  hero_description: 'Discover our curated portfolio of ultra-premium residential properties, from beachfront villas to sky-high penthouses.',
  cta_primary_text: 'View All Properties',
  cta_primary_link: '/residential#listings',
  cta_secondary_text: 'Book Viewing',
  cta_secondary_link: '/#contact',
  meta_title: 'Luxury Residential Properties Dubai — LuxEstate',
  meta_description: "Browse exclusive villas, penthouses and luxury apartments in Dubai's most prestigious locations.",
  sections: { search_bar: true, listings_grid: true, team_section: true, market_stats: true }
},
{
  key: 'commercial',
  label: 'Commercial',
  hero_headline: 'Premium Commercial Real Estate',
  hero_subheadline: "Office spaces, retail units & investment-grade commercial properties",
  hero_description: "Strategic commercial properties in Dubai's most sought-after business districts, offering exceptional yields and capital appreciation.",
  cta_primary_text: 'View Commercial',
  cta_primary_link: '/commercial#listings',
  cta_secondary_text: 'Get Investment Report',
  cta_secondary_link: '/#contact',
  meta_title: 'Commercial Properties Dubai — LuxEstate',
  meta_description: 'Premium office spaces, retail units and investment-grade commercial properties in Dubai.',
  sections: { listings_grid: true, market_insights: true, commercial_stats: true }
},
{
  key: 'projects',
  label: 'Projects',
  hero_headline: 'Off-Plan & New Developments',
  hero_subheadline: "Exclusive access to Dubai's most anticipated new projects",
  hero_description: "Invest in tomorrow's landmarks today. Our off-plan portfolio features the most sought-after developments from Dubai's leading developers.",
  cta_primary_text: 'View Projects',
  cta_primary_link: '/projects#gallery',
  cta_secondary_text: 'Register Interest',
  cta_secondary_link: '/#contact',
  meta_title: 'Off-Plan Projects Dubai — LuxEstate',
  meta_description: 'Exclusive off-plan and new development projects in Dubai from leading developers.',
  sections: { projects_gallery: true, project_timeline: true, project_inquiry: true }
},
{
  key: 'about',
  label: 'About',
  hero_headline: 'Redefining Luxury Real Estate',
  hero_subheadline: "A legacy of excellence in Dubai's premium property market",
  hero_description: 'LuxEstate was founded with a singular vision: to provide ultra-high-net-worth individuals with unparalleled access to the world\'s most exclusive properties.',
  cta_primary_text: 'Meet Our Team',
  cta_primary_link: '/about#team',
  cta_secondary_text: 'Our Story',
  cta_secondary_link: '/about#story',
  meta_title: 'About LuxEstate — Luxury Real Estate Dubai',
  meta_description: "Learn about LuxEstate's mission, team and 15+ years of excellence in Dubai's luxury property market.",
  sections: { team_section: true, stats_section: true, awards_section: true, timeline_section: true }
},
{
  key: 'blog',
  label: 'Blog',
  hero_headline: 'Market Insights & News',
  hero_subheadline: "Expert analysis on Dubai's luxury real estate market",
  hero_description: "Stay informed with the latest market trends, investment insights, and property news from LuxEstate's expert team.",
  cta_primary_text: 'Read Latest',
  cta_primary_link: '/blog#latest',
  cta_secondary_text: 'Subscribe',
  cta_secondary_link: '/blog#subscribe',
  meta_title: 'Real Estate Blog & Market Insights — LuxEstate',
  meta_description: 'Expert analysis, market trends and property investment insights from LuxEstate.',
  sections: { featured_post: true, posts_grid: true, categories_filter: true, newsletter_signup: true }
},
{
  key: 'contact',
  label: 'Contact',
  hero_headline: 'Get in Touch',
  hero_subheadline: 'Our team of specialists is ready to assist you',
  hero_description: "Whether you're buying, selling, or investing, our dedicated team provides personalised guidance every step of the way.",
  cta_primary_text: 'Send Message',
  cta_primary_link: '/contact#form',
  cta_secondary_text: 'WhatsApp Us',
  cta_secondary_link: 'https://wa.me/971508862683',
  meta_title: 'Contact LuxEstate — Luxury Real Estate Dubai',
  meta_description: "Contact LuxEstate's team of luxury property specialists in Dubai.",
  sections: { contact_form: true, map_section: true, office_details: true, whatsapp_button: true }
}];


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
  saveAll: () => {}
});

function mergeWithDefaults(stored: PageConfig): PageConfig {
  if (stored.key !== 'home') return stored;
  return {
    ...stored,
    hero_stats: stored.hero_stats ?? DEFAULT_HERO_STATS,
    featured_properties_content: stored.featured_properties_content ?? DEFAULT_FEATURED_PROPERTIES,
    featured_projects_content: stored.featured_projects_content ?? DEFAULT_FEATURED_PROJECTS,
    why_luxestate_content: stored.why_luxestate_content ?? DEFAULT_WHY_LUXESTATE,
    testimonials_content: stored.testimonials_content ?? DEFAULT_TESTIMONIALS,
    contact_content: stored.contact_content ?? DEFAULT_CONTACT,
    mortgage_content: stored.mortgage_content ?? DEFAULT_MORTGAGE,
    homepage_blocks: stored.homepage_blocks ?? DEFAULT_HOMEPAGE_BLOCKS
  };
}

export function CMSProvider({ children }: {children: React.ReactNode;}) {
  const [pages, setPages] = useState<PageConfig[]>(DEFAULT_PAGES);
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [lastSaved, setLastSaved] = useState<string | undefined>();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CMS_STORAGE_KEY);
      if (stored) {
        const data: CMSData = JSON.parse(stored);
        if (data.pages?.length) {
          const merged = data.pages.map(mergeWithDefaults);
          setPages(merged);
        }
        if (data.branding) setBranding(data.branding);
        if (data.lastSaved) setLastSaved(data.lastSaved);
      }
    } catch {

      // use defaults
    }}, []);

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
    }}, []);

  return (
    <CMSContext.Provider value={{ pages, branding, getPage, updatePage, updateBranding, saveAll, lastSaved }}>
      {children}
    </CMSContext.Provider>);

}

export function useCMS() {
  return useContext(CMSContext);
}

export function useCMSPage(key: PageKey) {
  const { getPage } = useCMS();
  return getPage(key);
}