'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const navLinks = [
  { label: 'Residential', href: '/residential' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'Projects', href: '/projects' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

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
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'nav-scrolled py-4' :'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <AppLogo
              size={36}
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-foreground font-bold text-xl tracking-tight hidden sm:block">
              Cove Estates
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks?.map((link) => (
              <Link
                key={link?.href}
                href={link?.href}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group ${
                  pathname === link?.href
                    ? 'text-primary' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link?.label}
                <span
                  className={`absolute bottom-0 left-5 right-5 h-px bg-primary transition-transform duration-300 origin-left ${
                    pathname === link?.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/971508862683"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center justify-center w-9 h-9 border border-primary/40 text-primary hover:bg-primary/10 transition-all duration-300"
              aria-label="Chat on WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>

            <Link
              href="/#contact"
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-accent group"
            >
              <span>Enquire</span>
              <Icon name="ArrowRightIcon" size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 border border-border text-foreground hover:border-primary transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <Icon name={menuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={20} />
            </button>
          </div>
        </div>
      </header>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/98 backdrop-blur-xl flex flex-col pt-24 px-8">
          <nav className="flex flex-col gap-2">
            {navLinks?.map((link, i) => (
              <Link
                key={link?.href}
                href={link?.href}
                className={`py-5 text-2xl font-bold uppercase tracking-[0.15em] border-b border-border transition-colors duration-300 flex items-center justify-between ${
                  pathname === link?.href ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {link?.label}
                <Icon name="ArrowRightIcon" size={18} className="text-primary" />
              </Link>
            ))}
          </nav>
          <div className="mt-8">
            <Link
              href="/#contact"
              className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors duration-300"
            >
              Book a Consultation
              <Icon name="ArrowRightIcon" size={16} />
            </Link>
          </div>
          <div className="mt-auto pb-10">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              +971 50 886 2683 · hello@coveestates.com
            </p>
          </div>
        </div>
      )}
    </>
  );
}