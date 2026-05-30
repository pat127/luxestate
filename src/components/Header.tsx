'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useCMS } from '@/contexts/CMSContext';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import { useLanguage, LANGUAGES, Language } from '@/contexts/LanguageContext';

const NAV_KEYS = [
  { key: 'nav.residential', href: '/residential' },
  { key: 'nav.commercial', href: '/commercial' },
  { key: 'nav.projects', href: '/projects' },
  { key: 'nav.blog', href: '/blog' },
];

const MOBILE_NAV_KEYS = [
  { key: 'nav.residential', href: '/residential' },
  { key: 'nav.commercial', href: '/commercial' },
  { key: 'nav.projects', href: '/projects' },
  { key: 'nav.international', href: '/international' },
  { key: 'nav.about', href: '/about' },
  { key: 'nav.blog', href: '/blog' },
];

const CURRENCIES: Currency[] = ['AED', 'USD', 'GBP', 'EUR'];

function CurrencyLanguageSelector() {
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const [currOpen, setCurrOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const currRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (currRef.current && !currRef.current.contains(e.target as Node)) setCurrOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <div className="hidden md:flex items-center gap-1">
      {/* Currency Dropdown */}
      <div ref={currRef} className="relative">
        <button
          onClick={() => { setCurrOpen(!currOpen); setLangOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white/80 hover:text-primary border border-transparent hover:border-primary/30 transition-all duration-300"
        >
          {currency}
          <Icon name="ChevronDownIcon" size={11} className={`transition-transform duration-200 ${currOpen ? 'rotate-180' : ''}`} />
        </button>
        {currOpen && (
          <div className="absolute top-full right-0 mt-1 bg-card border border-border shadow-xl z-50 min-w-[80px]">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => { setCurrency(c); setCurrOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                  currency === c ? 'text-primary bg-primary/10' : 'text-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-white/20" />

      {/* Language Dropdown */}
      <div ref={langRef} className="relative">
        <button
          onClick={() => { setLangOpen(!langOpen); setCurrOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white/80 hover:text-primary border border-transparent hover:border-primary/30 transition-all duration-300"
        >
          {currentLang?.code.toUpperCase()}
          <Icon name="ChevronDownIcon" size={11} className={`transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
        </button>
        {langOpen && (
          <div className="absolute top-full right-0 mt-1 bg-card border border-border shadow-xl z-50 min-w-[140px]">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLanguage(l.code as Language); setLangOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors duration-200 flex items-center justify-between gap-3 ${
                  language === l.code ? 'text-primary bg-primary/10' : 'text-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span className="uppercase tracking-[0.15em]">{l.label}</span>
                <span className="text-muted-foreground font-normal normal-case tracking-normal">{l.nativeLabel}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { branding } = useCMS();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useLanguage();

  const logoSrc = branding?.logo_url || '/assets/images/app_logo.png';
  const waDigits = (branding?.whatsapp || '+971508862683').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${waDigits}`;
  const phone = branding?.phone || '+971 50 886 2683';
  const email = branding?.email || 'admin@coveestates.com';
  const showWhatsApp = branding?.show_whatsapp_button !== false;
  const isSticky = branding?.sticky_header !== false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`${isSticky ? 'fixed' : 'absolute'} top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled ? 'nav-scrolled py-3 md:py-4' : 'py-4 md:py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="block md:hidden">
              <AppLogo src={logoSrc} size={64} className="w-auto transition-transform duration-300 group-hover:scale-105" />
            </span>
            <span className="hidden md:block">
              <AppLogo src={logoSrc} size={76} className="w-auto transition-transform duration-300 group-hover:scale-105" />
            </span>
          </Link>

          {/* Desktop Nav - centered */}
          <nav className="hidden md:flex items-center justify-center gap-1 flex-1 mx-8">
            {NAV_KEYS?.map((link) => (
              <Link
                key={link?.href}
                href={link?.href}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group ${
                  pathname === link?.href ? 'text-primary' : 'text-white hover:text-primary'
                }`}
              >
                {t(link.key)}
                <span
                  className={`absolute bottom-0 left-5 right-5 h-px bg-primary transition-transform duration-300 origin-left ${
                    pathname === link?.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-2 md:gap-3">
            {showWhatsApp && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center justify-center w-9 h-9 border border-primary/40 text-primary hover:bg-primary/10 transition-all duration-300"
              aria-label={t('nav.whatsapp')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            )}

            <Link
              href="/#contact"
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-accent group"
            >
              <span>{t('nav.enquire')}</span>
              <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {showWhatsApp && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden flex items-center justify-center w-10 h-10 text-primary"
              aria-label={t('nav.whatsapp')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 border border-border text-foreground hover:border-primary transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <Icon name={menuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/98 backdrop-blur-xl flex flex-col overflow-y-auto">
          <div className="pt-20 px-6 pb-8 flex flex-col min-h-full">
            <nav className="flex flex-col gap-0 mt-2">
              {MOBILE_NAV_KEYS?.map((link, i) => (
                <Link
                  key={link?.href}
                  href={link?.href}
                  className={`py-4 text-xl font-bold uppercase tracking-[0.15em] border-b border-border transition-colors duration-300 flex items-center justify-between ${
                    pathname === link?.href ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {t(link.key)}
                  <Icon name="ArrowRightIcon" size={16} className="text-primary" />
                </Link>
              ))}
            </nav>

            {/* Mobile Currency + Language selectors */}
            <div className="mt-6 flex items-center gap-3 border-b border-border pb-6">
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{t('footer.currency_label')}</p>
                <div className="flex gap-2 flex-wrap">
                  {(['AED', 'USD', 'GBP', 'EUR'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] border transition-colors duration-200 ${
                        currency === c ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{t('footer.language_label')}</p>
                <div className="flex gap-2 flex-wrap">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code as Language)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] border transition-colors duration-200 ${
                        language === l.code ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {l.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/#contact"
                className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300 min-h-[52px]"
              >
                {t('nav.book_consultation')}
                <Icon name="ArrowRightIcon" size={16} />
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 border border-border text-sm font-bold uppercase tracking-[0.2em] text-foreground hover:border-primary hover:text-primary transition-colors duration-300 min-h-[52px]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('nav.whatsapp')}
              </a>
            </div>

            <div className="mt-auto pt-8">
              <p className="text-muted-foreground text-xs tracking-widest uppercase text-center">
                {phone} · {email}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
