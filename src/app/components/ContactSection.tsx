'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { ContactContent, DEFAULT_CONTACT } from '@/contexts/CMSContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackInquirySubmission } from '@/lib/analytics';
import { createClient } from '@/lib/supabase/client';
import { sendInquiryEmail } from '@/lib/sendInquiryEmail';

interface Props {
  content?: ContactContent;
}

export default function ContactSection({ content }: Props) {
  const c = content ?? DEFAULT_CONTACT;
  const details = c.details ?? DEFAULT_CONTACT.details;
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    propertyType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.animate-on-scroll').forEach((el) => {
              (el as HTMLElement).classList.add('visible');
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.from('leads').insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        source: 'Website',
        status: 'New',
        budget: form.budget || null,
        interest: form.propertyType || null,
        notes: form.message || null,
      });
    } catch {
      // silent fail — form still shows success to user
    }
    await sendInquiryEmail({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      budget: form.budget || undefined,
      propertyType: form.propertyType || undefined,
      message: form.message || undefined,
      formType: 'contact',
    });
    trackInquirySubmission({
      formType: 'contact',
      budget: form.budget,
      source: 'contact_section',
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const headlineWords = c.headline.split(' ');
  const lastWord = headlineWords.pop();
  const restHeadline = headlineWords.join(' ');

  return (
    <section id="contact" ref={sectionRef} className="py-16 md:py-24 px-4 md:px-10 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="animate-on-scroll">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
              {c.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tighter leading-none mb-6 md:mb-8">
              {restHeadline && <>{restHeadline}<br /></>}
              <span key={lastWord} className="text-gold-shimmer">{lastWord || c.headline_shimmer}</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8 md:mb-12 max-w-md">
              {c.description}
            </p>

            <div className="space-y-5">
              {details.map((item) => (
                <div key={item.label} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 min-w-[40px] border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                    <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-foreground font-medium text-sm break-words">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 md:mt-12 border border-border p-5 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-primary rounded-full" style={{ boxShadow: '0 0 8px rgba(201,168,76,0.6)' }} />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{c.availability_text}</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {c.availability_subtext}
              </p>
            </div>
          </div>

          <div className="animate-on-scroll">
            {submitted ? (
              <div className="bg-background border border-primary/30 p-8 md:p-12 text-center gold-glow-animate">
                <div className="w-16 h-16 border border-primary flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckIcon" size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{t('contact.received_title')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('contact.received_body')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">{t('contact.full_name')} *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground" placeholder="Alexandra Whitmore" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">{t('contact.email')} *</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground" placeholder="alex@family.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">{t('contact.phone')}</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground" placeholder="+1 (212) 000-0000" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">{t('contact.budget')}</label>
                    <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors cursor-pointer">
                      <option value="">{t('contact.budget_select')}</option>
                      <option value="1m-5m">$1M – $5M</option>
                      <option value="5m-15m">$5M – $15M</option>
                      <option value="15m-50m">$15M – $50M</option>
                      <option value="50m+">$50M+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">{t('contact.property_type')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'contact.property_residential', value: 'Residential' },
                      { key: 'contact.property_commercial', value: 'Commercial' },
                      { key: 'contact.property_new_dev', value: 'New Development' },
                    ].map((type) => (
                      <button key={type.value} type="button" onClick={() => setForm({ ...form, propertyType: type.value })} className={`py-3 text-xs font-bold border transition-all duration-300 ${form.propertyType === type.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`}>
                        {t(type.key)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">{t('contact.your_vision')}</label>
                  <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full bg-background border border-border text-foreground px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder-muted-foreground resize-none" placeholder={t('contact.vision_placeholder')} />
                </div>
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 group min-h-[52px] disabled:opacity-60">
                  {submitting ? 'Sending...' : t('contact.submit')}
                  <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <p className="text-muted-foreground text-[10px] text-center leading-relaxed">
                  {t('contact.discretion')}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}