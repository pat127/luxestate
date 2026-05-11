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

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.residential': 'Residential',
    'nav.commercial': 'Commercial',
    'nav.projects': 'Projects',
    'nav.international': 'International',
    'nav.about': 'About Us',
    'nav.enquire': 'Enquire',
    'nav.book_consultation': 'Book a Consultation',
    'nav.whatsapp': 'WhatsApp Us',
    // Hero
    'hero.search_placeholder': 'Search communities or areas...',
    'hero.search_button': 'Search',
    'hero.cta': 'Explore Properties',
    // Contact form
    'contact.title': 'Contact Us',
    'contact.full_name': 'Full Name',
    'contact.email': 'Email Address',
    'contact.phone': 'Phone',
    'contact.budget': 'Budget Range',
    'contact.budget_select': 'Select Range',
    'contact.property_type': 'Property Type',
    'contact.property_residential': 'Residential',
    'contact.property_commercial': 'Commercial',
    'contact.property_new_dev': 'New Development',
    'contact.your_vision': 'Your Vision',
    'contact.vision_placeholder': 'Tell us about your ideal property — location, architecture, lifestyle requirements...',
    'contact.submit': 'Submit Private Inquiry',
    'contact.discretion': 'All inquiries are handled with complete discretion. We never share client information.',
    'contact.received_title': 'Inquiry Received',
    'contact.received_body': 'Thank you for reaching out. A Cove Estates principal will contact you personally within 24 hours.',
    // Footer
    'footer.tagline': "Curating the world's finest properties for those who demand the exceptional. Dubai's premier luxury real estate agency.",
    'footer.company': 'Company',
    'footer.properties': 'Properties',
    'footer.areas': 'Areas We Cover',
    'footer.rights': 'All rights reserved.',
    'footer.copyright': '© 2026 Cove Estatez Real Estate LLC. All rights reserved.',
    'footer.company_about': 'About Us',
    'footer.company_blog': 'Blog',
    'footer.company_team': 'Our Team',
    'footer.company_careers': 'Careers',
    'footer.company_contact': 'Contact',
    'footer.prop_residential': 'Residential',
    'footer.prop_commercial': 'Commercial',
    'footer.prop_offplan': 'Off-Plan Projects',
    'footer.prop_international': 'International',
    'footer.prop_investment': 'Investment Properties',
    'footer.area_downtown': 'Downtown Dubai',
    'footer.area_palm': 'Palm Jumeirah',
    'footer.area_marina': 'Dubai Marina',
    'footer.area_emirates': 'Emirates Hills',
    'footer.area_difc': 'DIFC',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',
    'footer.currency_label': 'Currency',
    'footer.language_label': 'Language',
    // Property
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
    // Common
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
    // Nav
    'nav.residential': 'سكني',
    'nav.commercial': 'تجاري',
    'nav.projects': 'مشاريع',
    'nav.international': 'دولي',
    'nav.about': 'من نحن',
    'nav.enquire': 'استفسر',
    'nav.book_consultation': 'احجز استشارة',
    'nav.whatsapp': 'واتساب',
    // Hero
    'hero.search_placeholder': 'ابحث عن المجتمعات أو المناطق...',
    'hero.search_button': 'بحث',
    'hero.cta': 'استكشف العقارات',
    // Contact form
    'contact.title': 'اتصل بنا',
    'contact.full_name': 'الاسم الكامل',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'الهاتف',
    'contact.budget': 'نطاق الميزانية',
    'contact.budget_select': 'اختر النطاق',
    'contact.property_type': 'نوع العقار',
    'contact.property_residential': 'سكني',
    'contact.property_commercial': 'تجاري',
    'contact.property_new_dev': 'مشروع جديد',
    'contact.your_vision': 'رؤيتك',
    'contact.vision_placeholder': 'أخبرنا عن عقارك المثالي — الموقع، التصميم، متطلبات نمط الحياة...',
    'contact.submit': 'إرسال استفسار خاص',
    'contact.discretion': 'يتم التعامل مع جميع الاستفسارات بسرية تامة. لا نشارك معلومات العملاء أبدًا.',
    'contact.received_title': 'تم استلام الاستفسار',
    'contact.received_body': 'شكرًا لتواصلك معنا. سيتصل بك أحد مسؤولي كوف إيستيتس شخصيًا خلال 24 ساعة.',
    // Footer
    'footer.tagline': 'نختار أفضل العقارات في العالم لمن يطلبون الاستثنائي. وكالة العقارات الفاخرة الأولى في دبي.',
    'footer.company': 'الشركة',
    'footer.properties': 'العقارات',
    'footer.areas': 'المناطق التي نغطيها',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.copyright': '© 2026 كوف إيستيتس للعقارات. جميع الحقوق محفوظة.',
    'footer.company_about': 'من نحن',
    'footer.company_blog': 'المدونة',
    'footer.company_team': 'فريقنا',
    'footer.company_careers': 'وظائف',
    'footer.company_contact': 'اتصل بنا',
    'footer.prop_residential': 'سكني',
    'footer.prop_commercial': 'تجاري',
    'footer.prop_offplan': 'مشاريع على الخارطة',
    'footer.prop_international': 'دولي',
    'footer.prop_investment': 'عقارات استثمارية',
    'footer.area_downtown': 'وسط مدينة دبي',
    'footer.area_palm': 'نخلة جميرا',
    'footer.area_marina': 'مرسى دبي',
    'footer.area_emirates': 'تلال الإمارات',
    'footer.area_difc': 'مركز دبي المالي العالمي',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الخدمة',
    'footer.cookies': 'سياسة ملفات تعريف الارتباط',
    'footer.currency_label': 'العملة',
    'footer.language_label': 'اللغة',
    // Property
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
    // Common
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
    // Nav
    'nav.residential': 'Wohnimmobilien',
    'nav.commercial': 'Gewerbe',
    'nav.projects': 'Projekte',
    'nav.international': 'International',
    'nav.about': 'Über uns',
    'nav.enquire': 'Anfragen',
    'nav.book_consultation': 'Beratung buchen',
    'nav.whatsapp': 'WhatsApp',
    // Hero
    'hero.search_placeholder': 'Gemeinden oder Gebiete suchen...',
    'hero.search_button': 'Suchen',
    'hero.cta': 'Immobilien erkunden',
    // Contact form
    'contact.title': 'Kontakt',
    'contact.full_name': 'Vollständiger Name',
    'contact.email': 'E-Mail-Adresse',
    'contact.phone': 'Telefon',
    'contact.budget': 'Budgetrahmen',
    'contact.budget_select': 'Bereich wählen',
    'contact.property_type': 'Immobilientyp',
    'contact.property_residential': 'Wohnimmobilie',
    'contact.property_commercial': 'Gewerbeimmobilie',
    'contact.property_new_dev': 'Neubau',
    'contact.your_vision': 'Ihre Vorstellung',
    'contact.vision_placeholder': 'Beschreiben Sie Ihre Wunschimmobilie — Lage, Architektur, Lifestyle-Anforderungen...',
    'contact.submit': 'Private Anfrage senden',
    'contact.discretion': 'Alle Anfragen werden mit absoluter Diskretion behandelt. Wir geben keine Kundendaten weiter.',
    'contact.received_title': 'Anfrage erhalten',
    'contact.received_body': 'Vielen Dank für Ihre Kontaktaufnahme. Ein Cove Estates Berater wird sich innerhalb von 24 Stunden persönlich bei Ihnen melden.',
    // Footer
    'footer.tagline': 'Wir kuratieren die feinsten Immobilien der Welt für anspruchsvolle Kunden. Dubais führende Luxusimmobilienagentur.',
    'footer.company': 'Unternehmen',
    'footer.properties': 'Immobilien',
    'footer.areas': 'Unsere Gebiete',
    'footer.rights': 'Alle Rechte vorbehalten.',
    'footer.copyright': '© 2026 Cove Estatez Real Estate LLC. Alle Rechte vorbehalten.',
    'footer.company_about': 'Über uns',
    'footer.company_blog': 'Blog',
    'footer.company_team': 'Unser Team',
    'footer.company_careers': 'Karriere',
    'footer.company_contact': 'Kontakt',
    'footer.prop_residential': 'Wohnimmobilien',
    'footer.prop_commercial': 'Gewerbeimmobilien',
    'footer.prop_offplan': 'Off-Plan-Projekte',
    'footer.prop_international': 'International',
    'footer.prop_investment': 'Investitionsobjekte',
    'footer.area_downtown': 'Downtown Dubai',
    'footer.area_palm': 'Palm Jumeirah',
    'footer.area_marina': 'Dubai Marina',
    'footer.area_emirates': 'Emirates Hills',
    'footer.area_difc': 'DIFC',
    'footer.privacy': 'Datenschutzrichtlinie',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.cookies': 'Cookie-Richtlinie',
    'footer.currency_label': 'Währung',
    'footer.language_label': 'Sprache',
    // Property
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
    // Common
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
