import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const footerLinks = [
  { label: 'Residential', href: '/residential' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'Projects', href: '/projects' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];

const socialLinks = [
  { icon: 'GlobeAltIcon', label: 'Instagram', href: '#' },
  { icon: 'ChatBubbleLeftIcon', label: 'LinkedIn', href: '#' },
  { icon: 'TvIcon', label: 'YouTube', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        {/* Left: Logo + Tagline */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <AppLogo size={32} />
            <span className="text-foreground font-bold text-lg tracking-tight">LuxEstate</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            Curating the world's finest properties for those who demand the exceptional.
          </p>
        </div>

        {/* Right: Links + Social */}
        <div className="flex flex-col gap-6 items-start md:items-end">
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            {socialLinks.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 p-1"
              >
                <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={18} />
              </Link>
            ))}
            <span className="text-muted-foreground text-xs tracking-widest pl-4 border-l border-border">
              © 2026 LuxEstate
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}