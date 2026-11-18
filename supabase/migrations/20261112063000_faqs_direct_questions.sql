-- Rewrite seeded FAQs as natural, direct questions with the answer in the first sentence.
-- Matches on the original seeded question text so admin-edited FAQs are never overwritten.

UPDATE public.faqs SET
  question = 'Which areas of Dubai does Cove Estates cover?',
  answer = 'Cove Estates covers every major Dubai area, including Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, DIFC, Jumeirah and Emirates Hills. Our team has deep expertise across the entire emirate.'
WHERE question = 'What areas do you cover in Dubai?';

UPDATE public.faqs SET
  question = 'How do I buy a property in Dubai step by step?',
  answer = 'Buying a property in Dubai starts with a consultation to confirm your budget and requirements, followed by a shortlist, viewings, an offer, due diligence and transfer at the Dubai Land Department. Your Cove Estates agent guides you through every stage.'
WHERE question = 'How do I start the property buying process?';

UPDATE public.faqs SET
  question = 'What fees do I pay when buying a property in Dubai?',
  answer = 'Buyers in Dubai typically pay a 4% Dubai Land Department transfer fee, a 2% agency commission and a 0.25% mortgage registration fee if financing. We provide a full cost breakdown before you commit to any purchase.'
WHERE question = 'What fees should I expect when buying a property?';

UPDATE public.faqs SET
  question = 'Can foreigners buy property in Dubai?',
  answer = 'Yes, foreigners can buy freehold property in Dubai''s designated freehold areas, including Dubai Marina, Downtown Dubai and Palm Jumeirah. Our team guides you through the legal requirements.'
WHERE question = 'Can foreigners buy property in Dubai?';

UPDATE public.faqs SET
  question = 'What documents do I need to rent a property in Dubai?',
  answer = 'To rent a property in Dubai you need a passport copy, a UAE residence visa, an Emirates ID and proof of income or an employment letter. Corporate rentals may require additional company documents.'
WHERE question = 'What documents are required to rent a property?';

UPDATE public.faqs SET
  question = 'How long does a property purchase take in Dubai?',
  answer = 'A cash purchase in Dubai typically completes in 2 to 4 weeks, while a mortgage purchase usually takes 4 to 8 weeks depending on bank approval. Off-plan purchases follow the developer''s handover schedule.'
WHERE question = 'How long does a property transaction take?';

UPDATE public.faqs SET
  question = 'Does Cove Estates offer property management services in Dubai?',
  answer = 'Yes, Cove Estates offers full property management, including tenant sourcing, rent collection, maintenance coordination and regular inspections. Contact us to learn more about our management packages.'
WHERE question = 'Do you offer property management services?';

UPDATE public.faqs SET
  question = 'What is the difference between freehold and leasehold property in Dubai?',
  answer = 'Freehold gives you full, indefinite ownership of the property and land, while leasehold gives you ownership for a fixed term, typically up to 99 years. Most expat-friendly areas in Dubai offer freehold ownership.'
WHERE question = 'What is the difference between freehold and leasehold property?';
