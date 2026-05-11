'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'en' | 'ar' | 'de';

interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', dir: 'ltr' },
];

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

// Basic translations for UI elements
const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.residential': 'Residential',
    'nav.commercial': 'Commercial',
    'nav.projects': 'Projects',
    'nav.international': 'International',
    'nav.about': 'About Us',
    'nav.enquire': 'Enquire',
    'nav.book_consultation': 'Book a Consultation',
    'nav.whatsapp': 'WhatsApp Us',
    'hero.cta': 'Explore Properties',
    'contact.title': 'Contact Us',
    'footer.rights': 'All rights reserved.',
    'property.beds': 'Beds',
    'property.baths': 'Baths',
    'property.sqft': 'sqft',
    'property.for_sale': 'For Sale',
    'property.for_rent': 'For Rent',
    'property.price_on_request': 'Price on Request',
    'property.call_agent': 'Call Agent',
    'property.whatsapp': 'WhatsApp',
    'property.enquire': 'Enquire Now',
    'property.location': 'Location',
    'property.overview': 'Overview',
    'property.amenities': 'Amenities',
    'property.download_brochure': 'Download Brochure',
    'common.view_all': 'View All',
    'common.loading': 'Loading...',
    'common.no_results': 'No results found.',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
  },
  ar: {
    'nav.residential': 'سكني',
    'nav.commercial': 'تجاري',
    'nav.projects': 'مشاريع',
    'nav.international': 'دولي',
    'nav.about': 'من نحن',
    'nav.enquire': 'استفسر',
    'nav.book_consultation': 'احجز استشارة',
    'nav.whatsapp': 'واتساب',
    'hero.cta': 'استكشف العقارات',
    'contact.title': 'اتصل بنا',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'property.beds': 'غرف نوم',
    'property.baths': 'حمامات',
    'property.sqft': 'قدم مربع',
    'property.for_sale': 'للبيع',
    'property.for_rent': 'للإيجار',
    'property.price_on_request': 'السعر عند الطلب',
    'property.call_agent': 'اتصل بالوكيل',
    'property.whatsapp': 'واتساب',
    'property.enquire': 'استفسر الآن',
    'property.location': 'الموقع',
    'property.overview': 'نظرة عامة',
    'property.amenities': 'المرافق',
    'property.download_brochure': 'تحميل الكتيب',
    'common.view_all': 'عرض الكل',
    'common.loading': 'جار التحميل...',
    'common.no_results': 'لا توجد نتائج.',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.close': 'إغلاق',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.prev': 'السابق',
    'common.submit': 'إرسال',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.confirm': 'تأكيد',
  },
  de: {
    'nav.residential': 'Wohnimmobilien',
    'nav.commercial': 'Gewerbe',
    'nav.projects': 'Projekte',
    'nav.international': 'International',
    'nav.about': 'Über uns',
    'nav.enquire': 'Anfragen',
    'nav.book_consultation': 'Beratung buchen',
    'nav.whatsapp': 'WhatsApp',
    'hero.cta': 'Immobilien erkunden',
    'contact.title': 'Kontakt',
    'footer.rights': 'Alle Rechte vorbehalten.',
    'property.beds': 'Schlafzimmer',
    'property.baths': 'Badezimmer',
    'property.sqft': 'qm',
    'property.for_sale': 'Zu verkaufen',
    'property.for_rent': 'Zu vermieten',
    'property.price_on_request': 'Preis auf Anfrage',
    'property.call_agent': 'Makler anrufen',
    'property.whatsapp': 'WhatsApp',
    'property.enquire': 'Jetzt anfragen',
    'property.location': 'Lage',
    'property.overview': 'Übersicht',
    'property.amenities': 'Ausstattung',
    'property.download_brochure': 'Broschüre herunterladen',
    'common.view_all': 'Alle anzeigen',
    'common.loading': 'Wird geladen...',
    'common.no_results': 'Keine Ergebnisse.',
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.sort': 'Sortieren',
    'common.close': 'Schließen',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.prev': 'Zurück',
    'common.submit': 'Absenden',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.edit': 'Bearbeiten',
    'common.delete': 'Löschen',
    'common.confirm': 'Bestätigen',
  },
};

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  dir: 'ltr',
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    // Update document direction for RTL support
    if (typeof document !== 'undefined') {
      const langOption = LANGUAGES.find((l) => l.code === lang);
      document.documentElement.dir = langOption?.dir ?? 'ltr';
      document.documentElement.lang = lang;
    }
  }, []);

  const dir = LANGUAGES.find((l) => l.code === language)?.dir ?? 'ltr';

  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] ?? translations['en']?.[key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
