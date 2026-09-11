'use client';

import { useEffect } from 'react';
import { useCMS } from '@/contexts/CMSContext';

export default function DynamicSEO() {
  const { branding } = useCMS();

  useEffect(() => {
    if (!branding) return;

    if (branding.seo_title) {
      document.title = branding.seo_title;
    }

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setMetaProp = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    if (branding.seo_description) {
      setMeta('description', branding.seo_description);
    }

    if (branding.google_search_console) {
      setMeta('google-site-verification', branding.google_search_console);
    }

    if (branding.enable_og_tags !== false) {
      if (branding.seo_title) setMetaProp('og:title', branding.seo_title);
      if (branding.seo_description) setMetaProp('og:description', branding.seo_description);
    }

    // Dynamic favicon from CMS
    const setFavicon = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };
    const faviconHref = branding.favicon_url || '/favicon.ico';
    setFavicon('icon', faviconHref);
    setFavicon('shortcut icon', faviconHref);
  }, [branding]);

  return null;
}
