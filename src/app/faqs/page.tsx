'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export default function FAQsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase
        .from('faqs')
        .select('id, question, answer, category, sort_order')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (data) setFaqs(data);
      setLoading(false);
    };
    fetchFaqs();
  }, [supabase]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map((f) => f.category)));
    return ['All', ...cats];
  }, [faqs]);

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      const matchCat = activeCategory === 'All' || f.category === activeCategory;
      const matchSearch =
        !search ||
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [faqs, activeCategory, search]);

  const grouped = useMemo(() => {
    if (activeCategory !== 'All') return { [activeCategory]: filtered };
    return filtered.reduce<Record<string, FAQ[]>>((acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = [];
      acc[faq.category].push(faq);
      return acc;
    }, {});
  }, [filtered, activeCategory]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-card border-b border-border overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, var(--primary) 0%, transparent 60%)' }} />
          <div className="max-w-4xl mx-auto px-4 md:px-10 relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Support</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-5">
              Frequently Asked<br />
              <span className="text-primary">Questions</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Everything you need to know about buying, selling, and renting property in Dubai. Can&apos;t find your answer? Reach out to our team.
            </p>

            {/* Search */}
            <div className="mt-8 relative max-w-xl">
              <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors duration-200"
              />
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="border-b border-border bg-card/50 sticky top-0 z-30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 md:px-10">
            <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 border ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-10">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-card border border-border animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon name="QuestionMarkCircleIcon" size={26} className="text-primary" />
                </div>
                <p className="text-foreground font-semibold mb-2">No results found</p>
                <p className="text-muted-foreground text-sm">Try a different search term or category.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    {activeCategory === 'All' && (
                      <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4 pb-3 border-b border-border">
                        {category}
                      </h2>
                    )}
                    <div className="space-y-2">
                      {items.map((faq) => {
                        const isOpen = openId === faq.id;
                        return (
                          <div
                            key={faq.id}
                            className={`border transition-all duration-200 ${
                              isOpen ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:border-border/80'
                            }`}
                          >
                            <button
                              onClick={() => setOpenId(isOpen ? null : faq.id)}
                              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                            >
                              <span className={`text-sm font-semibold leading-snug ${isOpen ? 'text-primary' : 'text-foreground'}`}>
                                {faq.question}
                              </span>
                              <span className={`flex-shrink-0 w-7 h-7 flex items-center justify-center border transition-all duration-200 ${
                                isOpen ? 'border-primary/40 bg-primary/10' : 'border-border'
                              }`}>
                                <Icon
                                  name={isOpen ? 'MinusIcon' : 'PlusIcon'}
                                  size={14}
                                  className={isOpen ? 'text-primary' : 'text-muted-foreground'}
                                />
                              </span>
                            </button>
                            {isOpen && (
                              <div className="px-5 pb-5">
                                <div className="h-px bg-primary/20 mb-4" />
                                <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 border-t border-border bg-card/30">
          <div className="max-w-4xl mx-auto px-4 md:px-10 text-center">
            <h3 className="text-xl font-bold text-foreground mb-3">Still have questions?</h3>
            <p className="text-muted-foreground text-sm mb-6">Our team is ready to help you with any enquiries.</p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300"
            >
              Contact Us
              <Icon name="ArrowRightIcon" size={14} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
