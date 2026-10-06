'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import { useLanguage, LANGUAGES, Language } from '@/contexts/LanguageContext';
import { useCMS } from '@/contexts/CMSContext';

// SVG social icons
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YouTubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}

function MetaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_ICON_MAP: { key: string; Icon: React.FC<{ size?: number }>; label: string; fallback: string }[] = [
  { key: 'social_instagram', Icon: InstagramIcon, label: 'Instagram', fallback: 'https://instagram.com/coveestates' },
  { key: 'social_linkedin', Icon: LinkedInIcon, label: 'LinkedIn', fallback: 'https://linkedin.com/company/coveestates' },
  { key: 'social_youtube', Icon: YouTubeIcon, label: 'YouTube', fallback: 'https://youtube.com/@coveestates' },
  { key: 'social_facebook', Icon: MetaIcon, label: 'Facebook', fallback: 'https://facebook.com/coveestates' },
  { key: 'social_twitter', Icon: XIcon, label: 'X', fallback: 'https://x.com/coveestates' },
  { key: 'social_tiktok', Icon: TikTokIcon, label: 'TikTok', fallback: 'https://tiktok.com/@coveestates' },
];

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'EUR', label: 'EUR — Euro' },
];

function FooterColumn({ title, links, onLinkClick }: { title: string; links: { label: string; href: string; gold?: boolean }[]; onLinkClick?: (label: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {onLinkClick && link.href === '#careers-popup' ? (
              <button
                onClick={() => onLinkClick(link.label)}
                className="text-muted-foreground text-sm hover:text-primary transition-colors duration-300 py-0.5 inline-block"
              >
                {link.label}
              </button>
            ) : (
              <Link
                href={link.href}
                className={`text-sm transition-colors duration-300 py-0.5 inline-block ${
                  link.gold
                    ? 'text-[#C9A84C] font-semibold hover:text-[#e0c070]'
                    : 'text-muted-foreground hover:text-primary'
                }`}
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </Link>
            )}
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

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] border border-border px-3 py-2 text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
        aria-label="Select language"
      >
        <Icon name="GlobeAltIcon" size={13} className="text-primary" />
        {currentLang.code.toUpperCase()}
        <Icon name="ChevronDownIcon" size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-card border border-border shadow-xl z-50 min-w-[160px]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code as Language); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium tracking-wide hover:bg-primary/10 hover:text-primary transition-colors duration-200 flex items-center justify-between gap-3 ${language === l.code ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
            >
              <span className="uppercase tracking-[0.15em]">{l.label}</span>
              <span className="font-normal normal-case tracking-normal text-muted-foreground">{l.nativeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const cms = useCMS();
  const b = cms?.branding;
  const [careersOpen, setCareersOpen] = useState(false);

  const phone = b?.phone || '+971 50 886 2683';
  const email = b?.email || 'admin@coveestates.com';
  const address = b?.address || '8th Level, Moosa Tower 1, Dubai, UAE';
  const phoneTel = `tel:${phone.replace(/\s+/g, '')}`;

  const socialLinks = SOCIAL_ICON_MAP
    .map((s) => {
      const url = b ? (b as unknown as Record<string, string>)[s.key] : undefined;
      return { ...s, href: url || s.fallback };
    })
    .filter((s) => s.href);

  const companyLinks = [
    { label: t('footer.company_about'), href: '/about' },
    { label: t('footer.company_blog'), href: '/blog' },
    { label: 'FAQs', href: '/faqs' },
    { label: t('footer.company_careers'), href: '#careers-popup' },
    { label: t('footer.company_contact'), href: '/#contact' },
    { label: 'Reagle Advisory', href: 'https://reagle.ae', gold: true },
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
              <AppLogo size={115} src={cms?.branding?.logo_url || '/assets/images/app_logo.png'} className="brightness-0 invert" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {b?.tagline || t('footer.tagline')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
                >
                  <s.Icon size={16} />
                </Link>
              ))}
            </div>
            {/* Contact Info */}
            <div className="space-y-2.5 mt-1">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Icon name="PhoneIcon" size={12} className="text-primary flex-shrink-0" />
                <a href={phoneTel} className="hover:text-primary transition-colors duration-300">{phone}</a>
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Icon name="EnvelopeIcon" size={12} className="text-primary flex-shrink-0" />
                <span className="break-all">{email}</span>
              </p>
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Icon name="MapPinIcon" size={12} className="text-primary flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
            </div>
          </div>

          {/* Company Column */}
          <FooterColumn title={t('footer.company')} links={companyLinks} onLinkClick={() => setCareersOpen(true)} />

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
            © {new Date().getFullYear()} {b?.company_name || 'Cove Estates'} Real Estate LLC. All rights reserved.
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
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Careers Coming Soon Popup */}
      {careersOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setCareersOpen(false)}
        >
          <div
            className="bg-card border border-border shadow-2xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCareersOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <Icon name="XMarkIcon" size={20} />
            </button>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <Icon name="BriefcaseIcon" size={26} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-wide text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Our careers page is currently under construction. In the meantime, send your resume directly to us and we&apos;ll be in touch.
              </p>
              <a
                href="mailto:admin@coveestate.com"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold tracking-wide hover:bg-primary/90 transition-colors duration-300"
              >
                <Icon name="EnvelopeIcon" size={15} />
                admin@coveestate.com
              </a>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}