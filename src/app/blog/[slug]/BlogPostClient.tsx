'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { BLOG_AUTHOR } from '@/lib/seo/author';

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
  content?: string;
  featured_image?: string;
  tags?: string[];
  publish_date?: string;
}

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
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function BlogPostClient({ post, related }: { post: BlogPost; related: BlogPost[] }) {
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Increment views (client-side, non-blocking)
    supabase
      .from('blog_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', post.id)
      .then(() => {});
  }, [supabase, post.id, post.views]);

  const catClass = categoryColors[post.category] || 'text-primary border-primary/40 bg-primary/10';
  const displayDate = post.publish_date || post.created_at;

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />
        <div className="relative max-w-4xl mx-auto px-4 md:px-10 pb-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors duration-300">Home</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <Link href="/blog" className="hover:text-primary transition-colors duration-300">Journal</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Category + meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 border ${catClass}`}>
              {post.category}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Icon name="CalendarIcon" size={12} className="text-primary" />
              {formatDate(displayDate)}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Icon name="UserIcon" size={12} className="text-primary" />
              {post.author}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-5">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed border-l-2 border-primary pl-4 mb-8">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="max-w-5xl mx-auto px-4 md:px-10 mb-0">
            <div className="relative aspect-[21/9] overflow-hidden border border-border">
              <AppImage
                src={post.featured_image}
                alt={`Featured image for: ${post.title}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </section>

      {/* Article Content */}
      <section className="max-w-3xl mx-auto px-4 md:px-10 py-12 md:py-16">
        {post.content ? (
          <div
            className="prose prose-invert prose-sm md:prose-base max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-li:text-muted-foreground
              prose-blockquote:border-primary prose-blockquote:text-muted-foreground
              prose-hr:border-border"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        ) : (
          <p className="text-muted-foreground italic">No content available for this article.</p>
        )}

        {/* Author byline */}
        <aside
          aria-label="About the author"
          className="mt-12 pt-8 border-t border-border flex items-start gap-4"
        >
          <div className="w-14 h-14 flex-shrink-0 border border-primary/40 bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {post.author?.trim()?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-1">Written by</p>
            <p className="text-foreground font-bold text-base leading-tight">{BLOG_AUTHOR.name}</p>
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.15em] mt-1">
              {BLOG_AUTHOR.title}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">
              {BLOG_AUTHOR.bio}
            </p>
            <a
              href="https://linkedin.com/company/coveestates"
              target="_blank"
              rel="noopener noreferrer author"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold uppercase tracking-[0.15em] text-primary hover:underline"
            >
              LinkedIn
              <Icon name="ArrowRightIcon" size={12} />
            </a>
          </div>
        </aside>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 border border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 pt-8 border-t border-border">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary hover:gap-3 transition-all duration-300"
          >
            <Icon name="ArrowLeftIcon" size={14} />
            Back to Journal
          </Link>
        </div>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="border-t border-border bg-card/30">
          <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">More from</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">{post.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rp) => {
                const rCatClass = categoryColors[rp.category] || 'text-primary border-primary/40 bg-primary/10';
                const rDate = rp.publish_date || rp.created_at;
                return (
                  <Link key={rp.id} href={`/blog/${rp.slug}`} className="group block border border-border hover:border-primary/40 transition-all duration-500 bg-card overflow-hidden">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      {rp.featured_image ? (
                        <AppImage
                          src={rp.featured_image}
                          alt={`Related article: ${rp.title}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-background flex items-center justify-center">
                          <Icon name="NewspaperIcon" size={32} className="text-primary/20" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 border backdrop-blur-sm ${rCatClass}`}>
                          {rp.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">{rp.title}</h3>
                      <p className="text-xs text-muted-foreground">{formatDate(rDate)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
