import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { BLOG_AUTHOR } from '@/lib/seo/author';

/**
 * Cookie-free anon client for PUBLIC content. Does not call cookies(), so it never
 * depends on request/session state and always returns the same published data to crawlers.
 */
function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export interface ServerBlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: string;
  views: number;
  created_at: string;
  excerpt: string;
  content?: string;
  featured_image?: string;
  tags?: string[];
  publish_date?: string;
}

export interface ServerFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export interface ServerResidentialListing {
  id: string;
  name: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  tag: string;
  status: string;
  completion: string;
  image: string;
  alt: string;
  featured: boolean;
  isRent: boolean;
  priceRaw: number;
}

export interface ServerCommercialListing {
  id: string;
  name: string;
  location: string;
  price: string;
  type: string;
  sqft: string;
  pricePerSqft: string;
  status: string;
  image: string;
  alt: string;
  featured: boolean;
  isRent: boolean;
  priceRaw: number;
}

export interface ServerDisplayProject {
  id: string;
  name: string;
  developer: string;
  location: string;
  completion: string;
  units: number;
  priceFrom: string;
  status: string;
  statusColor: string;
  sold: number;
  type: string;
  image: string;
  alt: string;
  description: string;
  featured: boolean;
  colSpan: string;
  minBedrooms: number | null;
  maxBedrooms: number | null;
  sizeRange: string;
}

const RESIDENTIAL_CATEGORIES = ['Residential', 'Apartment', 'Villa', 'Townhouse', 'Penthouse'];
const COMMERCIAL_CATEGORIES = ['Commercial', 'Office', 'Retail', 'Warehouse', 'Investment', 'Land'];

/** Deterministic number formatting (no locale dependence) so SSR and client hydrate identically. */
export function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean) as string[];
  if (typeof raw === 'string') return raw.split(',').map((u) => u.trim()).filter(Boolean);
  return [];
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Active': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
    case 'Launching': return 'text-primary border-primary/30 bg-primary/10';
    case 'Completed': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
    case 'On Hold': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
    default: return 'text-primary border-primary/30 bg-primary/10';
  }
}

export async function fetchBlogPosts(): Promise<ServerBlogPost[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, author, status, views, created_at, excerpt, featured_image, tags, publish_date')
      .eq('status', 'Published')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[serverData] fetchBlogPosts failed:', error.message);
      return [];
    }
    return ((data as ServerBlogPost[]) ?? []).map((p) => ({ ...p, author: BLOG_AUTHOR.name }));
  } catch (e) {
    console.error('[serverData] fetchBlogPosts threw:', e);
    return [];
  }
}

export async function fetchBlogPostBySlug(slug: string): Promise<{ post: ServerBlogPost | null; related: ServerBlogPost[] }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'Published')
      .single();
    if (!data) return { post: null, related: [] };
    const { data: relatedData } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, author, created_at, excerpt, featured_image, publish_date, status, views')
      .eq('status', 'Published')
      .eq('category', data.category)
      .neq('id', data.id)
      .limit(3);
    return {
      post: { ...(data as ServerBlogPost), author: BLOG_AUTHOR.name },
      related: ((relatedData as ServerBlogPost[]) ?? []).map((p) => ({ ...p, author: BLOG_AUTHOR.name })),
    };
  } catch {
    return { post: null, related: [] };
  }
}

export async function fetchFaqs(): Promise<ServerFAQ[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('faqs')
      .select('id, question, answer, category, sort_order')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('[serverData] fetchFaqs failed:', error.message);
      return [];
    }
    return (data as ServerFAQ[]) ?? [];
  } catch (e) {
    console.error('[serverData] fetchFaqs threw:', e);
    return [];
  }
}

export async function fetchResidentialListings(): Promise<ServerResidentialListing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, reference_number, listing_type, location_area, price_aed, prop_category, property_type, availability, completion, bedrooms, bathrooms, area_sqft, image_urls, featured')
      .eq('published', true)
      .in('prop_category', RESIDENTIAL_CATEGORIES)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((p: any) => {
      const imgs = parseImages(p.image_urls);
      const rawCategory = p.prop_category || '';
      const displayTag = p.property_type || (rawCategory !== 'Residential' ? rawCategory : '') || 'Property';
      const isRent = /rent|lease/i.test(p.listing_type || '') || /^(CR|RR|R)-/i.test(p.reference_number || '');
      return {
        id: p.id,
        name: p.title || '',
        location: p.location_area || '',
        price: p.price_aed ? `AED ${formatNumber(Number(p.price_aed))}` : '—',
        priceRaw: p.price_aed ? Number(p.price_aed) : 0,
        beds: p.bedrooms || 0,
        baths: p.bathrooms || 0,
        sqft: p.area_sqft ? formatNumber(Number(p.area_sqft)) : '—',
        tag: displayTag,
        status: p.availability || 'Available',
        completion: p.completion || 'Ready',
        image: imgs.length > 0 ? imgs[0] : '',
        alt: p.title || 'Property image',
        featured: p.featured || false,
        isRent,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchCommercialListings(): Promise<ServerCommercialListing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, reference_number, location_area, price_aed, prop_category, property_type, availability, area_sqft, image_urls, featured, listing_type')
      .eq('published', true)
      .in('prop_category', COMMERCIAL_CATEGORIES)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((p: any) => {
      const imgs = parseImages(p.image_urls);
      const rawCategory = p.prop_category || '';
      const displayType = p.property_type || rawCategory || 'Commercial';
      const isRent = /rent|lease/i.test(p.listing_type || '') || /^CR-/i.test(p.reference_number || '');
      return {
        id: p.id,
        name: p.title || '',
        location: p.location_area || '',
        price: p.price_aed ? `AED ${formatNumber(Number(p.price_aed))}` : '—',
        priceRaw: p.price_aed ? Number(p.price_aed) : 0,
        type: displayType,
        sqft: p.area_sqft ? formatNumber(Number(p.area_sqft)) : '—',
        pricePerSqft:
          p.price_aed && p.area_sqft && Number(p.area_sqft) > 0
            ? `AED ${formatNumber(Number(p.price_aed) / Number(p.area_sqft))}`
            : '—',
        status: p.availability || 'Available',
        image: imgs.length > 0 ? imgs[0] : '',
        alt: p.title || 'Commercial property image',
        featured: p.featured || false,
        isRent,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchProjects(): Promise<ServerDisplayProject[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, developer, location_area, handover_date, total_units, starting_price, status, sold_units, project_type, images, description, featured, published, international, min_bedrooms, max_bedrooms, size_range')
      .eq('published', true)
      .eq('international', false)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((p: any) => {
      const imgs = Array.isArray(p.images) ? p.images : [];
      const coverImage = imgs[0]?.url || imgs[0]?.src || '';
      const coverAlt = imgs[0]?.caption || imgs[0]?.alt || p.name || '';
      return {
        id: p.id,
        name: p.name || '',
        developer: p.developer || '',
        location: p.location_area || '',
        completion: p.handover_date || '',
        units: p.total_units || 0,
        priceFrom: p.starting_price ? `AED ${formatNumber(Number(p.starting_price))}` : '',
        status: p.status || 'Active',
        statusColor: getStatusColor(p.status),
        sold: p.sold_units || 0,
        type: p.project_type || 'Residential',
        image: coverImage,
        alt: coverAlt,
        description: p.description || '',
        featured: p.featured === true,
        colSpan: p.featured === true ? 'md:col-span-2' : 'md:col-span-1',
        minBedrooms: p.min_bedrooms ?? null,
        maxBedrooms: p.max_bedrooms ?? null,
        sizeRange: p.size_range || '',
      };
    });
  } catch {
    return [];
  }
}

export async function fetchPropertyById(id: string): Promise<any | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('properties').select('*').eq('id', id).single();
    return data ?? null;
  } catch {
    return null;
  }
}
