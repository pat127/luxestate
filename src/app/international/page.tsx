import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InternationalHero from '@/app/international/components/InternationalHero';
import InternationalGallery from '@/app/international/components/InternationalGallery';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

export default function InternationalPage() {
  return (
    <CurrencyProvider defaultCurrency="USD">
      <main className="bg-background overflow-x-hidden">
        <Header />
        <InternationalHero />
        <InternationalGallery />
        <Footer />
      </main>
    </CurrencyProvider>
  );
}
