'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export type PageKey = 'home' | 'residential' | 'commercial' | 'projects' | 'about' | 'blog' | 'contact' | 'international';

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
  cta_primary_download_url?: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
  cta_secondary_download_url?: string;
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
  about_content?: AboutContent;
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

// ─── About Page CMS Types ─────────────────────────────────────────────────────

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutMilestone {
  year: string;
  event: string;
}

export interface AboutValue {
  icon: string;
  title: string;
  description: string;
}

export interface AboutCEO {
  name: string;
  role: string;
  bio: string;
  bio2: string;
  image: string;
  alt: string;
  linkedin: string;
}

export interface AboutContent {
  // Story section
  story_eyebrow: string;
  story_headline: string;
  story_headline_shimmer: string;
  story_paragraph1: string;
  story_paragraph2: string;
  story_paragraph3: string;
  milestones: AboutMilestone[];
  // Values section
  values_eyebrow: string;
  values_headline: string;
  values_subtext: string;
  values: AboutValue[];
  // CEO section
  ceo_eyebrow: string;
  ceo_section_headline: string;
  ceo_section_subtext: string;
  ceo: AboutCEO;
  ceo_stats: AboutStat[];
  // Hero stats
  hero_stats: AboutStat[];
}

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  story_eyebrow: 'Who We Are',
  story_headline: "Dubai's Premier",
  story_headline_shimmer: 'Luxury Advisory',
  story_paragraph1: 'Cove Estates was founded on a singular conviction: that luxury real estate deserves a fundamentally different approach. Not a transactional one, but an advisory one — where client outcomes are the only measure of success.',
  story_paragraph2: 'From our offices in Dubai Marina and DIFC, we serve a global clientele of private investors, family offices, and ultra-high-net-worth individuals seeking the finest residential and commercial properties in the UAE and internationally.',
  story_paragraph3: 'Our team of 24 specialists brings together expertise across residential sales, commercial investment, off-plan acquisitions, and international markets — offering clients a single, trusted point of contact for their entire real estate portfolio.',
  milestones: [
  { year: '2006', event: 'Founded in Dubai Marina with a team of three specialists focused on ultra-prime residential.' },
  { year: '2011', event: 'Expanded into commercial real estate and off-plan developments, partnering with Emaar and DAMAC.' },
  { year: '2016', event: 'Launched international division, connecting UAE investors with prime opportunities in London, New York, and Paris.' },
  { year: '2020', event: "Opened second office in DIFC, establishing presence in Dubai's financial district." },
  { year: '2024', event: 'Rebranded as Cove Estates, reflecting our evolution into a full-service luxury real estate advisory.' }],

  values_eyebrow: 'What Guides Us',
  values_headline: 'Our Core Values',
  values_subtext: 'The principles that shape every client interaction, every listing, and every transaction we undertake.',
  values: [
  { icon: 'ShieldCheckIcon', title: 'Uncompromising Integrity', description: 'Every transaction is conducted with full transparency. We represent your interests exclusively — no dual agency, no hidden incentives.' },
  { icon: 'StarIcon', title: 'Curated Excellence', description: 'We list only properties that meet our exacting standards. Quality over volume — always. Our portfolio reflects the finest the market offers.' },
  { icon: 'GlobeAltIcon', title: 'Global Perspective', description: 'With clients across 40+ countries, we bring international market intelligence to every local transaction and global reach to every listing.' },
  { icon: 'UserGroupIcon', title: 'Relationship First', description: 'We build lifelong client relationships, not one-time transactions. Your portfolio growth and satisfaction are our long-term measure of success.' }],

  ceo_eyebrow: 'Leadership',
  ceo_section_headline: 'Meet Our CEO',
  ceo_section_subtext: 'Visionary leadership built on two decades of luxury real estate expertise.',
  ceo: {
    name: 'Alexander Cove',
    role: 'Founder & Managing Director',
    bio: 'With 18 years in luxury real estate across Dubai, London, and New York, Alexander founded Cove Estates to redefine the premium property experience in the UAE.',
    bio2: "Under his leadership, Cove Estates has grown into Dubai's most trusted luxury real estate advisory, facilitating over AED 8.2 billion in transactions and serving clients across 40+ countries. Alexander's philosophy centres on long-term relationships, absolute discretion, and delivering outcomes that exceed expectations.",
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1a79b8e72-1763295320816.png',
    alt: 'Professional portrait of Alexander Cove, founder of Cove Estates, in a tailored dark suit against a modern office backdrop',
    linkedin: '#'
  },
  ceo_stats: [
  { value: '18+', label: 'Years Experience' },
  { value: 'AED 8.2B+', label: 'Transactions Led' },
  { value: '40+', label: 'Countries Served' },
  { value: '1,400+', label: 'Properties Sold' }],

  hero_stats: [
  { value: 'AED 8.2B+', label: 'Total Transaction Volume' },
  { value: '1,400+', label: 'Properties Sold' },
  { value: '40+', label: 'Countries Represented' },
  { value: '18', label: 'Years of Excellence' }]

};

// ─── Property Detail CMS Types ────────────────────────────────────────────────

export interface PropertyAmenity {
  icon: string;
  label: string;
}

export interface PropertyImage {
  src: string;
  alt: string;
}

export interface PropertyPOI {
  label: string;
  distance: string;
}

export interface PropertySimilar {
  id: number;
  name: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  tag: string;
  image: string;
  alt: string;
  href: string;
}

export interface PropertyAgent {
  name: string;
  title: string;
  phone: string;
  whatsapp: string;
  email: string;
  avatar: string;
  avatarAlt: string;
  listings: number;
  experience: string;
  languages: string;
}

export interface PropertyDetailContent {
  id: number;
  name: string;
  location: string;
  address: string;
  price: string;
  pricePerSqft: string;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  status: string;
  reference: string;
  completion: string;
  floors: string;
  parking: string;
  view: string;
  furnishing: string;
  description: string;
  highlights: string[];
  amenities: PropertyAmenity[];
  images: PropertyImage[];
  agent: PropertyAgent;
  location_coords: {lat: number;lng: number;};
  pois: PropertyPOI[];
  similar: PropertySimilar[];
}

// ─── Project Detail CMS Types ─────────────────────────────────────────────────

export interface ProjectUnitType {
  type: string;
  area: string;
  price: string;
  available: number;
}

export interface ProjectPaymentPhase {
  phase: string;
  percent: number;
  label: string;
  icon: string;
}

export interface ProjectConstructionPhase {
  phase: string;
  complete: number;
}

export interface ProjectSimilar {
  id: number;
  name: string;
  location: string;
  priceFrom: string;
  completion: string;
  units: number;
  image: string;
  alt: string;
  href: string;
}

export interface ProjectDetailContent {
  id: number;
  name: string;
  tagline: string;
  developer: string;
  architect: string;
  location: string;
  address: string;
  completion: string;
  units: number;
  floors: number;
  priceFrom: string;
  priceTo: string;
  status: string;
  sold: number;
  type: string;
  reference: string;
  description: string;
  highlights: string[];
  unitTypes: ProjectUnitType[];
  paymentPlan: ProjectPaymentPhase[];
  amenities: PropertyAmenity[];
  images: PropertyImage[];
  constructionProgress: ProjectConstructionPhase[];
  agent: PropertyAgent;
  location_coords: {lat: number;lng: number;};
  pois: PropertyPOI[];
  similar: ProjectSimilar[];
}

export interface BrandingConfig {
  company_name: string;
  tagline: string;
  primary_color: string;
  accent_color: string;
  font_family: string;
  border_radius?: string;
  logo_url?: string;
  favicon_url?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  social_instagram?: string;
  social_linkedin?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_youtube?: string;
  social_tiktok?: string;
  // Appearance
  dark_mode?: boolean;
  sticky_header?: boolean;
  scroll_animations?: boolean;
  gold_shimmer?: boolean;
  show_whatsapp_button?: boolean;
  // SEO
  seo_title?: string;
  seo_description?: string;
  google_analytics_id?: string;
  google_search_console?: string;
  enable_sitemap?: boolean;
  enable_robots?: boolean;
  enable_jsonld?: boolean;
  enable_og_tags?: boolean;
  // Workflow
  auto_assign_leads?: boolean;
  lead_notifications?: boolean;
  deal_stage_alerts?: boolean;
  task_reminders?: boolean;
  weekly_reports?: boolean;
  lead_assignment_method?: string;
  followup_days?: number;
}

export interface CMSData {
  pages: PageConfig[];
  branding: BrandingConfig;
  propertyDetail?: PropertyDetailContent;
  projectDetail?: ProjectDetailContent;
  lastSaved?: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  company_name: 'Cove Estates',
  tagline: 'Luxury Real Estate in Dubai',
  primary_color: '#C9A84C',
  accent_color: '#B8963E',
  font_family: 'Plus Jakarta Sans',
  border_radius: '0px',
  logo_url: '/assets/images/app_logo.png',
  phone: '+971 50 886 2683',
  email: 'admin@coveestates.com',
  whatsapp: '+971508862683',
  address: '8th Level, Moosa Tower 1, Dubai, UAE',
  social_instagram: 'https://instagram.com/coveestates',
  social_linkedin: 'https://linkedin.com/company/coveestates',
  social_facebook: 'https://facebook.com/coveestates',
  social_twitter: 'https://x.com/coveestates',
  social_youtube: 'https://youtube.com/@coveestates',
  social_tiktok: 'https://tiktok.com/@coveestates',
  dark_mode: true,
  sticky_header: true,
  scroll_animations: true,
  gold_shimmer: true,
  show_whatsapp_button: true,
  seo_title: 'Cove Estates — Ultra-Premium Properties for Discerning Buyers',
  seo_description: "Cove Estates curates the world's finest residential and commercial properties for high-net-worth buyers.",
  google_analytics_id: '',
  google_search_console: '',
  enable_sitemap: true,
  enable_robots: true,
  enable_jsonld: true,
  enable_og_tags: true,
  auto_assign_leads: true,
  lead_notifications: true,
  deal_stage_alerts: true,
  task_reminders: true,
  weekly_reports: true,
  lead_assignment_method: 'Round Robin',
  followup_days: 3
};

export const DEFAULT_HOMEPAGE_BLOCKS: HomepageBlock[] = [
{ key: 'featured_properties', label: 'Featured Properties', visible: true, order: 1, editable: true },
{ key: 'featured_projects', label: 'Featured Projects', visible: true, order: 2, editable: true },
{ key: 'why_luxestate', label: 'Why Cove Estates', visible: true, order: 3, editable: true },
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
  { id: 3, name: 'The Whitmore', location: 'Tribeca, New York', price: '$9,800,000', beds: 3, baths: 3, sqft: '3,600', tag: 'Townhouse', href: '/residential', image: "https://img.rocket.new/generatedImages/rocket_gen_img_16b1063fe-1769250021551.png", alt: 'Luxury Tribeca townhouse facade, dark brick and steel' },
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
  { id: 1, name: 'Skyline Residences', developer: 'Emaar', location: 'Downtown Dubai', type: 'Off-Plan', completion: 'Q4 2026', price: 'AED 1.2M+', units: 240, sold: 75, image: "https://img.rocket.new/generatedImages/rocket_gen_img_13a2e0b28-1772151212727.png", alt: 'Modern residential tower in Downtown Dubai at dusk, glass facade, dramatic lighting', tag: 'Selling Fast' },
  { id: 2, name: 'Marina Bay Towers', developer: 'DAMAC', location: 'Dubai Marina', type: 'Off-Plan', completion: 'Q2 2027', price: 'AED 900K+', units: 320, sold: 65, image: "https://images.unsplash.com/photo-1735561650147-27d4d3e1002c", alt: 'Twin towers rising over Dubai Marina waterfront, golden hour reflections on glass', tag: 'New Launch' },
  { id: 3, name: 'Creek Horizon', developer: 'Meraas', location: 'Dubai Creek', type: 'Off-Plan', completion: 'Q3 2028', price: 'AED 1.8M+', units: 180, sold: 0, image: "https://img.rocket.new/generatedImages/rocket_gen_img_10e7e337d-1772064904447.png", alt: 'Luxury waterfront development along Dubai Creek, contemporary architecture', tag: 'Launching Soon' }]

};

export const DEFAULT_WHY_LUXESTATE: WhyLuxEstateContent = {
  eyebrow: 'The Cove Estates Difference',
  headline: 'Our',
  headline_shimmer: 'Process',
  subtext: 'Three decades of combined expertise, an unmatched off-market network, and a singular obsession with client outcomes.',
  left_title: 'How The',
  left_subtitle: 'Process Works',
  cta_text: 'Begin Your Search',
  cta_link: '#contact',
  steps: [
  { id: '1', number: '01', title: 'Curated Discovery', description: 'We begin with a confidential consultation to understand your vision — lifestyle requirements, investment objectives, and the architectural character that resonates with you. No mass listings. Only properties that match your precise criteria.', badge: 'Bespoke Matching', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c136d863-1766818210862.png", imageAlt: 'Luxury real estate consultation, dark mahogany desk, architectural blueprints' },
  { id: '2', number: '02', title: 'Private Access', description: 'Seventy percent of our portfolio never reaches the open market. Through 18 years of relationships with developers, estate families, and institutional owners, we unlock properties before they are ever listed publicly.', badge: 'Off-Market Network', image: "https://img.rocket.new/generatedImages/rocket_gen_img_19a27d91f-1778631641621.png", imageAlt: 'Exclusive private estate driveway at dusk, iron gates, dramatic architectural lighting' },
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
  { name: 'Margaret Harrington', location: 'Greenwich, Connecticut', quote: "Cove Estates found us a property that wasn't on any public listing. The discretion and access they provide is unlike anything we've experienced in twenty years of property ownership.", role: 'Private Equity Principal', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b32bbd93-1763299584368.png', imageAlt: 'Professional woman in elegant dark blazer, studio portrait' },
  { name: 'Thomas Blackwell', location: 'Upper East Side, New York', quote: 'The caliber of off-market opportunities they surfaced was extraordinary.', role: 'Investment Banker', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1bfef8bd5-1763295388609.png', imageAlt: 'Professional man in tailored dark suit, confident expression, studio portrait' },
  { name: 'Priya Mehta', location: 'Beverly Hills, California', quote: "From first consultation to keys in hand — Cove Estates handled every detail with precision I've only ever seen in the most elite service firms.", role: 'Technology Entrepreneur', image: "https://img.rocket.new/generatedImages/rocket_gen_img_135fed5ac-1772395890088.png", imageAlt: 'Professional woman with elegant styling, warm smile, portrait', isCenter: true },
  { name: 'James Whitfield', location: 'Palm Beach, Florida', quote: 'Truly exceptional service.', role: 'Family Office Director', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1651cfc0b-1763295052209.png', imageAlt: 'Professional man in dark jacket, confident posture, studio portrait' },
  { name: 'Catherine Novak', location: 'Miami, Florida', quote: 'The network is unmatched.', role: 'Art Collector', image: "https://images.unsplash.com/photo-1727107045061-42e6158551c6", imageAlt: 'Stylish woman in dark outfit, professional portrait' }],

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
  { icon: 'EnvelopeIcon', label: 'Private Email', value: 'acquisitions@coveestates.com' },
  { icon: 'MapPinIcon', label: 'Headquarters', value: '432 Park Avenue, New York, NY 10022' }]

};

export const DEFAULT_MORTGAGE: MortgageContent = {
  eyebrow: 'Financial Planning',
  headline: 'Mortgage\nCalculator',
  description: 'Estimate your monthly payments and understand the full financial picture before you commit.',
  cta_text: 'Speak with a Financial Advisor',
  cta_link: '#contact'
};

// ─── Property Detail Default ──────────────────────────────────────────────────

export const DEFAULT_PROPERTY_DETAIL: PropertyDetailContent = {
  id: 1,
  name: 'Penthouse at One Palm',
  location: 'Palm Jumeirah, Dubai',
  address: 'One Palm Residences, Palm Jumeirah, Dubai, UAE',
  price: 'AED 85,000,000',
  pricePerSqft: 'AED 8,200 / sqft',
  beds: 5,
  baths: 6,
  sqft: 10366,
  type: 'Penthouse',
  status: 'For Sale',
  reference: 'CE-PJ-0042',
  completion: 'Ready',
  floors: 'Floors 22–23',
  parking: '4 Spaces',
  view: 'Full Sea & Skyline',
  furnishing: 'Fully Furnished',
  description: `An extraordinary duplex penthouse crowning One Palm — the most prestigious address on Palm Jumeirah. Spanning two full floors with 270-degree panoramic views of the Arabian Gulf, Dubai Marina skyline, and the iconic Burj Al Arab, this residence redefines ultra-luxury living in Dubai.\n\nDesigned by the world-renowned Dorchester Collection, every detail has been curated to the highest standard. Bespoke Italian marble, hand-selected artworks, and a private rooftop terrace with an infinity pool create an unparalleled living experience.`,
  highlights: [
  'Private rooftop infinity pool & terrace',
  'Dorchester Collection interior design',
  'Direct beach access & private marina berth',
  '270° panoramic sea & skyline views',
  'Smart home automation throughout',
  'Private elevator & dedicated concierge'],

  amenities: [
  { icon: 'SparklesIcon', label: 'Infinity Pool' },
  { icon: 'HomeIcon', label: 'Private Beach' },
  { icon: 'ShieldCheckIcon', label: '24/7 Security' },
  { icon: 'StarIcon', label: 'Concierge' },
  { icon: 'BoltIcon', label: 'Smart Home' },
  { icon: 'TrophyIcon', label: 'Fitness Center' },
  { icon: 'GlobeAltIcon', label: 'Spa & Wellness' },
  { icon: 'BuildingOfficeIcon', label: 'Business Lounge' },
  { icon: 'MusicalNoteIcon', label: 'Cinema Room' },
  { icon: 'FireIcon', label: 'Rooftop Terrace' },
  { icon: 'ArrowsPointingOutIcon', label: 'Valet Parking' },
  { icon: 'MapPinIcon', label: 'Marina Berth' }],

  images: [
  { src: 'https://img.rocket.new/generatedImages/rocket_gen_img_127d6dc96-1773156342470.png', alt: 'Luxury penthouse living room with floor-to-ceiling windows overlooking Palm Jumeirah and Arabian Gulf, white marble floors, bespoke furniture' },
  { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1fd2affb4-1772229041034.png", alt: 'Master bedroom suite with panoramic sea views, king bed, dark wood accents, and private terrace access' },
  { src: 'https://images.unsplash.com/photo-1679265441414-d5ed0aed8a38', alt: 'Private rooftop infinity pool with Dubai Marina skyline backdrop at golden hour' },
  { src: 'https://img.rocket.new/generatedImages/rocket_gen_img_173dd8d64-1772641736960.png', alt: 'Gourmet kitchen with Italian marble countertops, integrated appliances, and island seating' },
  { src: 'https://images.unsplash.com/photo-1537726235470-8504e3beef77', alt: 'Dining area with dramatic chandelier, floor-to-ceiling windows, and sea views' },
  { src: 'https://img.rocket.new/generatedImages/rocket_gen_img_192331c36-1777354895465.png', alt: 'Outdoor terrace with lounge seating, fire pit, and unobstructed Burj Al Arab views at dusk' }],

  agent: {
    name: 'Alexandra Voss',
    title: 'Senior Luxury Property Consultant',
    phone: '+971 50 886 2683',
    whatsapp: '971508862683',
    email: 'alexandra@coveestates.com',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_15831eb38-1768374767097.png",
    avatarAlt: 'Alexandra Voss, Senior Luxury Property Consultant at Cove Estates',
    listings: 47,
    experience: '12 Years',
    languages: 'English, Arabic, French'
  },
  location_coords: { lat: 25.1124, lng: 55.1390 },
  pois: [
  { label: 'Dubai Mall', distance: '12 min' },
  { label: 'Dubai Airport', distance: '25 min' },
  { label: 'Marina Walk', distance: '8 min' },
  { label: 'Burj Al Arab', distance: '5 min' }],

  similar: [
  { id: 2, name: 'Sky Villa, Address Sky View', location: 'Downtown Dubai', price: 'AED 62,000,000', beds: 4, baths: 5, sqft: 7200, tag: 'For Sale', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f8add369-1771884478759.png", alt: 'Sky villa with Downtown Dubai skyline and Burj Khalifa views, modern luxury interior', href: '/properties/2' },
  { id: 3, name: 'Signature Villa, Emirates Hills', location: 'Emirates Hills, Dubai', price: 'AED 120,000,000', beds: 7, baths: 8, sqft: 18000, tag: 'For Sale', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_10c4732d9-1772210224317.png', alt: 'Grand Emirates Hills villa with golf course views, private pool, and lush landscaping', href: '/properties/3' },
  { id: 4, name: 'Penthouse, DIFC Living', location: 'DIFC, Dubai', price: 'AED 45,000,000', beds: 3, baths: 4, sqft: 5800, tag: 'For Sale', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_15dbdfb47-1773138915166.png', alt: 'DIFC penthouse with city skyline views, contemporary design, and rooftop terrace', href: '/properties/4' }]

};

// ─── Project Detail Default ───────────────────────────────────────────────────

export const DEFAULT_PROJECT_DETAIL: ProjectDetailContent = {
  id: 1,
  name: 'One Obsidian Tower',
  tagline: 'Redefining the Dubai Skyline',
  developer: 'Meridian Development Group',
  architect: 'Foster & Partners',
  location: 'Business Bay, Dubai',
  address: 'One Obsidian Tower, Business Bay, Dubai, UAE',
  completion: 'Q3 2027',
  units: 84,
  floors: 62,
  priceFrom: 'AED 8,500,000',
  priceTo: 'AED 95,000,000',
  status: 'Selling Now',
  sold: 62,
  type: 'Residential',
  reference: 'CE-OOT-001',
  description: `One Obsidian Tower is a landmark 62-story residential tower rising above Business Bay — Dubai's most dynamic address. Designed by the legendary Foster & Partners, the tower's dark glass facade captures and reflects the city's ever-changing light, creating a living sculpture on the skyline.\n\nWith only 84 residences across 62 floors, One Obsidian Tower offers an unmatched level of exclusivity. Each home features floor-to-ceiling glass, private sky terraces, and panoramic views of the Burj Khalifa, Dubai Creek, and the Arabian Gulf.\n\nResidents enjoy a curated collection of amenities spanning three dedicated floors — from the infinity sky pool on the 55th floor to the private cinema, members' lounge, and a world-class spa.`,
  highlights: [
  'Only 84 residences across 62 floors',
  'Foster & Partners architecture',
  'Sky infinity pool on 55th floor',
  'Private sky terraces on all units',
  'Panoramic Burj Khalifa views',
  'Dedicated concierge & lifestyle team',
  'Smart home automation throughout',
  'LEED Gold certified building'],

  unitTypes: [
  { type: '1 Bedroom', area: '1,200 – 1,800 sqft', price: 'From AED 8,500,000', available: 8 },
  { type: '2 Bedroom', area: '2,100 – 3,200 sqft', price: 'From AED 14,000,000', available: 6 },
  { type: '3 Bedroom', area: '3,800 – 5,500 sqft', price: 'From AED 24,000,000', available: 5 },
  { type: 'Sky Villa', area: '7,200 – 9,800 sqft', price: 'From AED 55,000,000', available: 3 },
  { type: 'Penthouse', area: '12,000 – 18,000 sqft', price: 'From AED 85,000,000', available: 2 }],

  paymentPlan: [
  { phase: 'Booking', percent: 10, label: 'On Signing SPA', icon: 'PencilSquareIcon' },
  { phase: '1st Instalment', percent: 20, label: 'Within 30 Days', icon: 'CalendarIcon' },
  { phase: 'Construction', percent: 40, label: 'During Construction (4 Instalments)', icon: 'BuildingOfficeIcon' },
  { phase: 'Handover', percent: 30, label: 'On Completion Q3 2027', icon: 'KeyIcon' }],

  amenities: [
  { icon: 'SparklesIcon', label: 'Sky Infinity Pool' },
  { icon: 'HomeIcon', label: 'Private Beach Club' },
  { icon: 'ShieldCheckIcon', label: '24/7 Concierge' },
  { icon: 'StarIcon', label: 'Members Lounge' },
  { icon: 'BoltIcon', label: 'Smart Home' },
  { icon: 'TrophyIcon', label: 'Fitness & Wellness' },
  { icon: 'GlobeAltIcon', label: 'Spa & Hammam' },
  { icon: 'BuildingOfficeIcon', label: 'Business Centre' },
  { icon: 'MusicalNoteIcon', label: 'Private Cinema' },
  { icon: 'FireIcon', label: 'Sky Terrace Lounge' },
  { icon: 'ArrowsPointingOutIcon', label: 'Valet Parking' },
  { icon: 'MapPinIcon', label: 'Helipad' }],

  images: [
  { src: 'https://images.unsplash.com/photo-1685534830735-9cbdfe7b955b', alt: 'One Obsidian Tower exterior rendering at dusk, dark glass facade reflecting Dubai skyline, dramatic lighting' },
  { src: 'https://images.unsplash.com/photo-1578200228871-2d5389cc82f6', alt: 'Sky infinity pool on 55th floor with panoramic Burj Khalifa and Business Bay views at golden hour' },
  { src: 'https://img.rocket.new/generatedImages/rocket_gen_img_15b6c49fe-1769420947258.png', alt: 'Luxury 3-bedroom residence interior with floor-to-ceiling windows, marble floors, and Dubai Creek views' },
  { src: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f985e3a-1774106261093.png', alt: 'Tower lobby with double-height ceilings, dark marble, and bespoke art installation' },
  { src: 'https://img.rocket.new/generatedImages/rocket_gen_img_18177980c-1777959943189.png', alt: 'Members lounge with panoramic city views, bespoke furniture, and curated art collection' },
  { src: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ce78b5ae-1764745340163.png', alt: 'Sky terrace lounge at night with fire features, city lights backdrop, and outdoor dining' }],

  constructionProgress: [
  { phase: 'Foundation & Basement', complete: 100 },
  { phase: 'Core & Structure (Floors 1–30)', complete: 100 },
  { phase: 'Core & Structure (Floors 31–62)', complete: 65 },
  { phase: 'Facade & Glazing', complete: 40 },
  { phase: 'MEP & Fit-Out', complete: 20 },
  { phase: 'Amenities & Landscaping', complete: 5 }],

  agent: {
    name: 'Marcus Al-Rashid',
    title: 'Off-Plan Investment Specialist',
    phone: '+971 50 886 2683',
    whatsapp: '971508862683',
    email: 'marcus@coveestates.com',
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10ff7b3a0-1772221573304.png",
    avatarAlt: 'Marcus Al-Rashid, Off-Plan Investment Specialist at Cove Estates',
    listings: 31,
    experience: '9 Years',
    languages: 'English, Arabic'
  },
  location_coords: { lat: 25.1865, lng: 55.2615 },
  pois: [
  { label: 'Dubai Mall', distance: '8 min' },
  { label: 'Dubai Airport', distance: '20 min' },
  { label: 'DIFC', distance: '5 min' },
  { label: 'Burj Khalifa', distance: '6 min' }],

  similar: [
  { id: 2, name: 'Seraphine Residences', location: 'Beverly Hills, CA', priceFrom: 'From AED 14,000,000', completion: 'Q1 2027', units: 32, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a5a737aa-1778059435159.png", alt: 'Seraphine Residences luxury tower rendering, flowing organic architecture, dramatic dusk lighting', href: '/projects/2' },
  { id: 3, name: 'The Monarch', location: 'Miami Beach, FL', priceFrom: 'From AED 4,200,000', completion: 'Q4 2026', units: 120, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1064062a9-1778059435164.png", alt: 'The Monarch luxury mixed-use development, geometric white facade, ocean backdrop, golden hour', href: '/projects/3' },
  { id: 4, name: 'The Halcyon', location: 'Greenwich, CT', priceFrom: 'From AED 18,000,000', completion: 'Q1 2028', units: 22, image: "https://img.rocket.new/generatedImages/rocket_gen_img_1faf938f1-1778137755172.png", alt: 'The Halcyon estate development, classical modern architecture, Connecticut countryside, overcast sky', href: '/projects/4' }]

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
  meta_title: 'Cove Estates — Ultra-Premium Properties for Discerning Buyers',
  meta_description: "Cove Estates curates the world's finest residential and commercial properties for high-net-worth buyers.",
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
  hero_image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f8add369-1771884478759.png",
  cta_primary_text: 'View All Properties',
  cta_primary_link: '/residential#listings',
  cta_secondary_text: 'Book Viewing',
  cta_secondary_link: '/#contact',
  meta_title: 'Luxury Residential Properties Dubai — Cove Estates',
  meta_description: "Browse exclusive villas, penthouses and luxury apartments in Dubai's most prestigious locations.",
  sections: { search_bar: true, listings_grid: true, team_section: true, market_stats: true }
},
{
  key: 'commercial',
  label: 'Commercial',
  hero_headline: 'Premium Commercial Real Estate',
  hero_subheadline: "Office spaces, retail units & investment-grade commercial properties",
  hero_description: "Strategic commercial properties in Dubai's most sought-after business districts, offering exceptional yields and capital appreciation.",
  hero_image: "https://img.rocket.new/generatedImages/rocket_gen_img_14b926046-1765893546612.png",
  cta_primary_text: 'View Commercial',
  cta_primary_link: '/commercial#listings',
  cta_secondary_text: 'Get Investment Report',
  cta_secondary_link: '/#contact',
  meta_title: 'Commercial Properties Dubai — Cove Estates',
  meta_description: 'Premium office spaces, retail units and investment-grade commercial properties in Dubai.',
  sections: { listings_grid: true, market_insights: true, commercial_stats: true }
},
{
  key: 'projects',
  label: 'Projects',
  hero_headline: 'Off-Plan & New Developments',
  hero_subheadline: "Exclusive access to Dubai's most anticipated new projects",
  hero_description: "Invest in tomorrow's landmarks today. Our off-plan portfolio features the most sought-after developments from Dubai's leading developers.",
  hero_image: "https://img.rocket.new/generatedImages/rocket_gen_img_1daea8c2c-1782366223260.png",
  cta_primary_text: 'View Projects',
  cta_primary_link: '/projects#gallery',
  cta_secondary_text: 'Register Interest',
  cta_secondary_link: '/#contact',
  meta_title: 'Off-Plan Projects Dubai — Cove Estates',
  meta_description: 'Exclusive off-plan and new development projects in Dubai from leading developers.',
  sections: { projects_gallery: true, project_timeline: true, project_inquiry: true, stats_section: true }
},
{
  key: 'about',
  label: 'About',
  hero_headline: 'Redefining Luxury Real Estate',
  hero_subheadline: "A legacy of excellence in Dubai's premium property market",
  hero_description: 'Cove Estates was founded with a singular vision: to provide ultra-high-net-worth individuals with unparalleled access to the world\'s most exclusive properties.',
  hero_image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f8add369-1771884478759.png",
  cta_primary_text: 'Meet Our Team',
  cta_primary_link: '/about#team',
  cta_secondary_text: 'Our Story',
  cta_secondary_link: '/about#story',
  meta_title: 'About Cove Estates — Luxury Real Estate Dubai',
  meta_description: "Learn about Cove Estates's mission, team and 15+ years of excellence in Dubai's luxury property market.",
  sections: { team_section: true, stats_section: true, awards_section: true, timeline_section: true }
},
{
  key: 'blog',
  label: 'Blog',
  hero_headline: 'Market Insights & News',
  hero_subheadline: "Expert analysis on Dubai's luxury real estate market",
  hero_description: "Stay informed with the latest market trends, investment insights, and property news from Cove Estates's expert team.",
  hero_image: "https://images.unsplash.com/photo-1583743145829-6186e8c43589",
  cta_primary_text: 'Read Latest',
  cta_primary_link: '/blog#latest',
  cta_secondary_text: 'Subscribe',
  cta_secondary_link: '/blog#subscribe',
  meta_title: 'Real Estate Blog & Market Insights — Cove Estates',
  meta_description: 'Expert analysis, market trends and property investment insights from Cove Estates.',
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
  meta_title: 'Contact Cove Estates — Luxury Real Estate Dubai',
  meta_description: "Contact Cove Estates's team of luxury property specialists in Dubai.",
  sections: { contact_form: true, map_section: true, office_details: true, whatsapp_button: true }
},
{
  key: 'international',
  label: 'International',
  hero_headline: 'World-Class Properties, Every Continent',
  hero_subheadline: 'Global Portfolio',
  hero_description: "Curated international developments from the world's most sought-after cities — exclusively sourced for UAE-based investors seeking global diversification.",
  hero_image: "https://images.unsplash.com/photo-1573151644820-a590e2737744",
  cta_primary_text: 'Explore Global',
  cta_primary_link: '/international#gallery',
  cta_secondary_text: 'Register Interest',
  cta_secondary_link: '/#contact',
  meta_title: 'International Properties — Cove Estates',
  meta_description: 'Curated international luxury properties for UAE-based investors seeking global diversification.',
  sections: { gallery: true, inquiry: true }
}];


interface CMSContextValue {
  pages: PageConfig[];
  branding: BrandingConfig;
  propertyDetail: PropertyDetailContent;
  projectDetail: ProjectDetailContent;
  getPage: (key: PageKey) => PageConfig;
  updatePage: (page: PageConfig) => void;
  updateBranding: (b: BrandingConfig) => void;
  updatePropertyDetail: (p: PropertyDetailContent) => void;
  updateProjectDetail: (p: ProjectDetailContent) => void;
  saveAll: (pages: PageConfig[], branding: BrandingConfig, propertyDetail?: PropertyDetailContent, projectDetail?: ProjectDetailContent) => Promise<void>;
  lastSaved?: string;
  loaded: boolean;
}

const CMSContext = createContext<CMSContextValue>({
  pages: [],
  branding: DEFAULT_BRANDING,
  propertyDetail: DEFAULT_PROPERTY_DETAIL,
  projectDetail: DEFAULT_PROJECT_DETAIL,
  getPage: (key) => DEFAULT_PAGES.find((p) => p.key === key) || DEFAULT_PAGES[0],
  updatePage: () => {},
  updateBranding: () => {},
  updatePropertyDetail: () => {},
  updateProjectDetail: () => {},
  saveAll: async () => {},
  loaded: false
});

function mergeWithDefaults(stored: PageConfig): PageConfig {
  const defaultPage = DEFAULT_PAGES.find((p) => p.key === stored.key);
  if (stored.key !== 'home') {
    const mergedSections = defaultPage ?
    { ...defaultPage.sections, ...stored.sections } :
    stored.sections;
    return {
      ...(defaultPage || {}),
      ...stored,
      sections: mergedSections,
      hero_image: stored.hero_image?.trim() || defaultPage?.hero_image || ''
    };
  }
  // Deep merge: stored values take priority, only fill in completely missing keys
  return {
    ...stored,
    hero_stats: stored.hero_stats && stored.hero_stats.length > 0 ? stored.hero_stats : DEFAULT_HERO_STATS,
    featured_properties_content: stored.featured_properties_content ?
    { ...DEFAULT_FEATURED_PROPERTIES, ...stored.featured_properties_content } :
    DEFAULT_FEATURED_PROPERTIES,
    featured_projects_content: stored.featured_projects_content ?
    { ...DEFAULT_FEATURED_PROJECTS, ...stored.featured_projects_content } :
    DEFAULT_FEATURED_PROJECTS,
    why_luxestate_content: stored.why_luxestate_content ?
    { ...DEFAULT_WHY_LUXESTATE, ...stored.why_luxestate_content } :
    DEFAULT_WHY_LUXESTATE,
    testimonials_content: stored.testimonials_content ?
    { ...DEFAULT_TESTIMONIALS, ...stored.testimonials_content } :
    DEFAULT_TESTIMONIALS,
    contact_content: stored.contact_content ?
    { ...DEFAULT_CONTACT, ...stored.contact_content } :
    DEFAULT_CONTACT,
    mortgage_content: stored.mortgage_content ?
    { ...DEFAULT_MORTGAGE, ...stored.mortgage_content } :
    DEFAULT_MORTGAGE,
    homepage_blocks: stored.homepage_blocks && stored.homepage_blocks.length > 0 ?
    stored.homepage_blocks :
    DEFAULT_HOMEPAGE_BLOCKS
  };
}

function parseCMSData(data: CMSData) {
  const pages = data.pages?.length ?
  DEFAULT_PAGES.map((defaultPage) => {
    const storedPage = data.pages.find((p) => p.key === defaultPage.key);
    if (!storedPage) return defaultPage;
    return mergeWithDefaults(storedPage);
  }) :
  DEFAULT_PAGES;
  return {
    pages,
    branding: data.branding ? { ...DEFAULT_BRANDING, ...data.branding } : DEFAULT_BRANDING,
    propertyDetail: data.propertyDetail ? { ...DEFAULT_PROPERTY_DETAIL, ...data.propertyDetail } : DEFAULT_PROPERTY_DETAIL,
    projectDetail: data.projectDetail ? { ...DEFAULT_PROJECT_DETAIL, ...data.projectDetail } : DEFAULT_PROJECT_DETAIL,
    lastSaved: data.lastSaved
  };
}

export function CMSProvider({
  children,
  initialCmsData = null,
  initialUpdatedAt = null




}: {children: React.ReactNode;initialCmsData?: CMSData | null;initialUpdatedAt?: string | null;}) {
  const hasServerBoot = !!(initialCmsData && Object.keys(initialCmsData).length > 0);
  const boot = hasServerBoot ? parseCMSData(initialCmsData!) : null;

  const [pages, setPages] = useState<PageConfig[]>(boot?.pages ?? DEFAULT_PAGES);
  const [branding, setBranding] = useState<BrandingConfig>(boot?.branding ?? DEFAULT_BRANDING);
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetailContent>(boot?.propertyDetail ?? DEFAULT_PROPERTY_DETAIL);
  const [projectDetail, setProjectDetail] = useState<ProjectDetailContent>(boot?.projectDetail ?? DEFAULT_PROJECT_DETAIL);
  const [lastSaved, setLastSaved] = useState<string | undefined>(boot?.lastSaved);
  const [loaded, setLoaded] = useState(hasServerBoot);
  const supabaseRef = useRef(createClient());
  const cmsUpdatedAtRef = useRef<string | null>(initialUpdatedAt);
  const serverBootRef = useRef(hasServerBoot);
  const serverUpdatedAtRef = useRef(initialUpdatedAt);

  useEffect(() => {
    if (!branding) return;
    const root = document.documentElement;
    if (branding.primary_color) root.style.setProperty('--primary', branding.primary_color);
    if (branding.accent_color) root.style.setProperty('--accent', branding.accent_color);
    if (branding.font_family) root.style.setProperty('--font-sans', `'${branding.font_family}', sans-serif`);
    if (branding.border_radius) root.style.setProperty('--radius', branding.border_radius);
    if (branding.gold_shimmer === false) root.classList.add('no-shimmer');else
    root.classList.remove('no-shimmer');
    if (branding.scroll_animations === false) root.classList.add('no-animations');else
    root.classList.remove('no-animations');
  }, [branding]);

  useEffect(() => {
    let cancelled = false;

    supabaseRef.current.
    from('site_settings').
    select('data, updated_at').
    eq('key', 'cms_config').
    single().
    then(async ({ data, error }) => {
      if (cancelled) return;
      if (!error && data?.data && Object.keys(data.data).length > 0) {
        const nextUpdatedAt = (data as {updated_at?: string;})?.updated_at ?? null;
        if (serverBootRef.current && nextUpdatedAt && nextUpdatedAt === serverUpdatedAtRef.current) {
          setLoaded(true);
          return;
        }
        const remote = parseCMSData(data.data as CMSData);
        cmsUpdatedAtRef.current = nextUpdatedAt;
        setPages(remote.pages);
        setBranding(remote.branding);
        setPropertyDetail(remote.propertyDetail);
        setProjectDetail(remote.projectDetail);
        setLastSaved(remote.lastSaved);
      } else if (!serverBootRef.current) {
        const ts = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const seedPayload: CMSData = {
          pages: DEFAULT_PAGES,
          branding: DEFAULT_BRANDING,
          propertyDetail: DEFAULT_PROPERTY_DETAIL,
          projectDetail: DEFAULT_PROJECT_DETAIL,
          lastSaved: ts
        };
        await supabaseRef.current.
        from('site_settings').
        upsert({ key: 'cms_config', data: seedPayload, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (!cancelled) setLastSaved(ts);
      }
      setLoaded(true);
    });

    return () => {cancelled = true;};
  }, []);

  // Keep CMS data in sync across all open sessions.
  // When an admin saves changes, visitors should see updated content without refresh.
  useEffect(() => {
    const sb = supabaseRef.current;
    const channel = sb.
    channel('site_settings_cms_config').
    on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: 'key=eq.cms_config'
      },
      (payload) => {
        const nextData = (payload as any)?.new?.data;
        const nextUpdatedAt = (payload as any)?.new?.updated_at as string | undefined;
        if (!nextData || typeof nextData !== 'object') return;
        const remote = parseCMSData(nextData as CMSData);
        if (nextUpdatedAt) cmsUpdatedAtRef.current = nextUpdatedAt;
        setPages(remote.pages);
        setBranding(remote.branding);
        setPropertyDetail(remote.propertyDetail);
        setProjectDetail(remote.projectDetail);
        setLastSaved(remote.lastSaved);
        setLoaded(true);
      }
    ).
    subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  // Fallback for environments where Realtime replication isn't enabled for the table:
  // periodically check `updated_at` and refresh if it changed.
  useEffect(() => {
    const sb = supabaseRef.current;
    const interval = setInterval(async () => {
      try {
        const { data, error } = await sb.
        from('site_settings').
        select('data, updated_at').
        eq('key', 'cms_config').
        single();
        if (error || !data?.data) return;
        const nextUpdatedAt = (data as any)?.updated_at as string | undefined;
        if (!nextUpdatedAt || nextUpdatedAt === cmsUpdatedAtRef.current) return;
        cmsUpdatedAtRef.current = nextUpdatedAt;
        const remote = parseCMSData(data.data as CMSData);
        setPages(remote.pages);
        setBranding(remote.branding);
        setPropertyDetail(remote.propertyDetail);
        setProjectDetail(remote.projectDetail);
        setLastSaved(remote.lastSaved);
        setLoaded(true);
      } catch {




        // ignore transient network errors
      }}, 4000);return () => clearInterval(interval);}, []);

  const getPage = useCallback(
    (key: PageKey): PageConfig => pages.find((p) => p.key === key) || DEFAULT_PAGES.find((p) => p.key === key) || DEFAULT_PAGES[0],
    [pages]
  );

  const updatePage = useCallback((updated: PageConfig) => {
    setPages((prev) => prev.map((p) => p.key === updated.key ? updated : p));
  }, []);

  const updateBranding = useCallback((b: BrandingConfig) => setBranding(b), []);
  const updatePropertyDetail = useCallback((p: PropertyDetailContent) => setPropertyDetail(p), []);
  const updateProjectDetail = useCallback((p: ProjectDetailContent) => setProjectDetail(p), []);

  const saveAll = useCallback(
    async (newPages: PageConfig[], newBranding: BrandingConfig, newPropertyDetail?: PropertyDetailContent, newProjectDetail?: ProjectDetailContent) => {
      const ts = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const pd = newPropertyDetail ?? propertyDetail;
      const prd = newProjectDetail ?? projectDetail;

      setPages(newPages);
      setBranding(newBranding);
      setPropertyDetail(pd);
      setProjectDetail(prd);
      setLastSaved(ts);

      const payload: CMSData = { pages: newPages, branding: newBranding, propertyDetail: pd, projectDetail: prd, lastSaved: ts };

      const { error } = await supabaseRef.current.
      from('site_settings').
      upsert({ key: 'cms_config', data: payload, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
    },
    [propertyDetail, projectDetail]
  );

  return (
    <CMSContext.Provider value={{ pages, branding, propertyDetail, projectDetail, getPage, updatePage, updateBranding, updatePropertyDetail, updateProjectDetail, saveAll, lastSaved, loaded }}>
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