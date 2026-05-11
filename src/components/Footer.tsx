'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import { useLanguage } from '@/contexts/LanguageContext';

const socialLinks = [
  { icon: 'GlobeAltIcon' as const, label: 'Instagram', href: 'https://instagram.com/coveestates' },
  { icon: 'ChatBubbleLeftIcon' as const, label: 'LinkedIn', href: 'https://linkedin.com/company/coveestates' },
  { icon: 'TvIcon' as const, label: 'YouTube', href: 'https://youtube.com/@coveestates' },
];

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'EUR', label: 'EUR — Euro' },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-muted-foreground text-sm hover:text-primary transition-colors duration-300 py-0.5 inline-block"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const selected = CURRENCY_OPTIONS.find((o) => o.value === currency) ?? CURRENCY_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] border border-border px-3 py-2 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
        aria-label="Select currency"
      >
        <Icon name="CurrencyDollarIcon" size={13} className="text-primary" />
        {selected.value}
        <Icon name="ChevronDownIcon" size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-card border border-border shadow-xl z-50 min-w-[180px]">
          {CURRENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setCurrency(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium tracking-wide hover:bg-primary/10 hover:text-primary transition-colors duration-200 ${currency === opt.value ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();

  const companyLinks = [
    { label: t('footer.company_about'), href: '/about' },
    { label: t('footer.company_blog'), href: '/blog' },
    { label: t('footer.company_team'), href: '/about#team' },
    { label: t('footer.company_careers'), href: '#' },
    { label: t('footer.company_contact'), href: '/#contact' },
  ];

  const propertyLinks = [
    { label: t('footer.prop_residential'), href: '/residential' },
    { label: t('footer.prop_commercial'), href: '/commercial' },
    { label: t('footer.prop_offplan'), href: '/projects' },
    { label: t('footer.prop_international'), href: '/international' },
    { label: t('footer.prop_investment'), href: '/residential' },
  ];

  const areaLinks = [
    { label: t('footer.area_downtown'), href: '/residential' },
    { label: t('footer.area_palm'), href: '/residential' },
    { label: t('footer.area_marina'), href: '/residential' },
    { label: t('footer.area_emirates'), href: '/residential' },
    { label: t('footer.area_difc'), href: '/commercial' },
  ];

  const legalLinks = [
    { label: t('footer.privacy'), href: '/privacy-policy' },
    { label: t('footer.terms'), href: '/terms-of-service' },
    { label: t('footer.cookies'), href: '/cookie-policy' },
  ];

  return (
    <footer className="border-t border-border bg-background">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Brand Column - full width on mobile */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <AppLogo size={48} />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
                >
                  <Icon name={s.icon} size={16} />
                </Link>
              ))}
            </div>
            {/* Contact Info */}
            <div className="space-y-2.5 mt-1">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Icon name="PhoneIcon" size={12} className="text-primary flex-shrink-0" />
                <a href="tel:+971508862683" className="hover:text-primary transition-colors duration-300">+971 50 886 2683</a>
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Icon name="EnvelopeIcon" size={12} className="text-primary flex-shrink-0" />
                <span className="break-all">admin@coveestates.com</span>
              </p>
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Icon name="MapPinIcon" size={12} className="text-primary flex-shrink-0 mt-0.5" />
                <span>8th Level, Moosa Tower 1, Dubai, UAE</span>
              </p>
            </div>
          </div>

          {/* Company Column */}
          <FooterColumn title={t('footer.company')} links={companyLinks} />

          {/* Properties Column */}
          <FooterColumn title={t('footer.properties')} links={propertyLinks} />

          {/* Areas Column - hidden on small mobile, shown from md */}
          <div className="col-span-2 md:col-span-1">
            <FooterColumn title={t('footer.areas')} links={areaLinks} />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-muted-foreground text-xs tracking-widest text-center sm:text-left">
            {t('footer.copyright')}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground text-xs hover:text-primary transition-colors duration-300 py-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <CurrencySelector />
          </div>
        </div>
      </div>
    </footer>
  );
}