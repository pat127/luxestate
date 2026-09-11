'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useCMS } from '@/contexts/CMSContext';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: string;
  views: number;
  created_at: string;
  excerpt: string;
  featured_image?: string;
  tags?: string[];
  publish_date?: string;
}

const FALLBACK_CATEGORIES = ['All', 'Market Insights', 'Off-Plan', 'Investment', 'Residential', 'Legal', 'Lifestyle'];

const categoryColors: Record<string, string> = {
  'Market Insights': 'text-primary border-primary/40 bg-primary/10',
  'Off-Plan': 'text-blue-400 border-blue-400/40 bg-blue-400/10',
  'Investment': 'text-purple-400 border-purple-400/40 bg-purple-400/10',
  'Residential': 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10',
  'Legal': 'text-orange-400 border-orange-400/40 bg-orange-400/10',
  'Lifestyle': 'text-pink-400 border-pink-400/40 bg-pink-400/10',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const catClass = categoryColors[post.category] || 'text-primary border-primary/40 bg-primary/10';
  const displayDate = post.publish_date || post.created_at;

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block col-span-2 relative overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 bg-card">
        <div className="grid md:grid-cols-2 min-h-[420px]">
          {/* Image */}
          <div className="relative overflow-hidden bg-muted min-h-[260px] md:min-h-0">
            <AppImage
              src={post.featured_image || '/assets/images/no_image.png'}
              alt={`Featured image for blog post: ${post.title}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/60 hidden md:block" />
          </div>
          {/* Content */}
          <div className="flex flex-col justify-center p-8 md:p-10 gap-4">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 border ${catClass}`}>
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-[0.1em]">Featured</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Icon name="UserIcon" size={12} className="text-primary" />
                {post.author}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Icon name="CalendarIcon" size={12} className="text-primary" />
                {formatDate(displayDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.15em] mt-2 group-hover:gap-3 transition-all duration-300">
              Read Article
              <Icon name="ArrowRightIcon" size={14} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block border border-border hover:border-primary/40 transition-all duration-500 bg-card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-muted aspect-[16/9]">
        <AppImage
          src={post.featured_image || '/assets/images/no_image.png'}
          alt={`Blog post image: ${post.title}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 border backdrop-blur-sm ${catClass}`}>
            {post.category}
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="UserIcon" size={11} className="text-primary" />
              {post.author}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="CalendarIcon" size={11} className="text-primary" />
              {formatDate(displayDate)}
            </span>
          </div>
          <Icon name="ArrowRightIcon" size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const supabase = useMemo(() => createClient(), []);
  const { getPage } = useCMS();
  const blogPage = getPage('blog');

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);

  // CMS-driven content
  const heroEyebrow = blogPage.hero_subheadline || 'Insights & News';
  const heroHeadline = blogPage.hero_headline || 'Market Insights & News';
  const heroDescription = blogPage.hero_description || 'Expert perspectives on Dubai real estate — market trends, investment insights, and lifestyle guides from our team.';
  const heroImage = blogPage.hero_image || '';

  // CMS-driven section visibility
  const showCategoriesFilter = blogPage.sections?.categories_filter !== false;
  const showFeaturedPost = blogPage.sections?.featured_post !== false;
  const showPostsGrid = blogPage.sections?.posts_grid !== false;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, category, author, status, views, created_at, excerpt, featured_image, tags, publish_date')
        .eq('status', 'Published')
        .order('created_at', { ascending: false });
      if (data) {
        setPosts(data);
        // Build dynamic category list from actual posts
        const cats = Array.from(new Set(data.map((p: BlogPost) => p.category).filter(Boolean)));
        if (cats.length > 0) {
          setCategories(['All', ...cats]);
        }
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const filtered = posts.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = search === '' || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredPost = filtered[0];
  const restPosts = showFeaturedPost ? filtered.slice(1) : filtered;

  // Split headline: first word(s) on first line, last word with shimmer on second line
  const headlineWords = heroHeadline.trim().split(/\s+/);
  const shimmerWord = headlineWords.length > 1 ? headlineWords[headlineWords.length - 1] : heroHeadline;
  const mainWords = headlineWords.length > 1 ? headlineWords.slice(0, -1).join(' ') : '';

  return (
    <main className="bg-background overflow-x-hidden page-enter">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        {heroImage ? (
          <>
            <div className="absolute inset-0">
              <AppImage
                src={heroImage}
                alt="Blog hero background"
                fill
                className="object-cover opacity-10"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/80 to-background" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        )}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">{heroEyebrow}</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] mb-5">
              {mainWords && <>{mainWords}<br /></>}
              <span className="relative inline-block text-primary">
                <span className="relative z-10">{shimmerWord}</span>
                <span
                  className="absolute inset-0 z-20 overflow-hidden"
                  aria-hidden="true"
                >
                  <span
                    className="absolute inset-0 -skew-x-12 translate-x-[-150%] animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ animationDelay: '0.5s' }}
                  />
                </span>
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
              {heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      {showCategoriesFilter && (
        <section className="sticky top-[60px] z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 border ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-primary hover:border-primary/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors duration-300"
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-border bg-card animate-pulse">
                <div className="aspect-[16/9] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 border border-border flex items-center justify-center">
              <Icon name="NewspaperIcon" size={28} className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-bold text-lg">No articles found</p>
            <p className="text-muted-foreground text-sm max-w-xs">
              {search ? `No results for "${search}". Try a different search term.` : 'No published articles in this category yet.'}
            </p>
            {(search || activeCategory !== 'All') && (
              <button
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                className="mt-2 px-6 py-2.5 border border-primary text-primary text-xs font-bold uppercase tracking-[0.15em] hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured post */}
            {showFeaturedPost && featuredPost && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BlogCard post={featuredPost} featured />
              </div>
            )}
            {/* Posts grid */}
            {showPostsGrid && restPosts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
