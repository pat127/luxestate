-- FAQs table migration
-- Creates the faqs table for the public FAQs page and admin CMS management

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faqs_is_published ON public.faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON public.faqs(sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Public can read published FAQs
DROP POLICY IF EXISTS "public_can_read_faqs" ON public.faqs;
CREATE POLICY "public_can_read_faqs"
  ON public.faqs
  FOR SELECT
  TO public
  USING (is_published = true);

-- Authenticated users (admins) can manage all FAQs
DROP POLICY IF EXISTS "admins_manage_faqs" ON public.faqs;
CREATE POLICY "admins_manage_faqs"
  ON public.faqs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_faqs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS faqs_updated_at ON public.faqs;
CREATE TRIGGER faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_faqs_updated_at();

-- Seed some sample FAQs
INSERT INTO public.faqs (question, answer, category, sort_order, is_published) VALUES
  ('What areas do you cover in Dubai?', 'We cover all major areas in Dubai including Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, DIFC, Jumeirah, Emirates Hills, and many more. Our team has deep expertise across the entire emirate.', 'General', 1, true),
  ('How do I start the property buying process?', 'The process begins with a consultation with one of our agents to understand your requirements and budget. We then shortlist suitable properties, arrange viewings, and guide you through the offer, due diligence, and transfer process at the Dubai Land Department.', 'Buying', 2, true),
  ('What fees should I expect when buying a property?', 'Typical costs include a 4% Dubai Land Department transfer fee, a 2% agency commission, and a mortgage registration fee of 0.25% if financing. We provide a full cost breakdown before you commit to any purchase.', 'Buying', 3, true),
  ('Can foreigners buy property in Dubai?', 'Yes, foreigners can purchase freehold property in designated areas across Dubai. These include popular locations such as Dubai Marina, Downtown Dubai, Palm Jumeirah, and many others. Our team will guide you through the legal requirements.', 'Buying', 4, true),
  ('What documents are required to rent a property?', 'To rent a property in Dubai you will need a valid passport copy, UAE residence visa, Emirates ID, and proof of income or employment letter. For corporate rentals, additional company documents may be required.', 'Renting', 5, true),
  ('How long does a property transaction take?', 'A cash transaction typically completes within 2 to 4 weeks. Mortgage transactions usually take 4 to 8 weeks depending on the bank approval timeline. Off-plan purchases follow the developer''s handover schedule.', 'General', 6, true),
  ('Do you offer property management services?', 'Yes, we offer comprehensive property management services including tenant sourcing, rent collection, maintenance coordination, and regular property inspections. Contact us to learn more about our management packages.', 'Services', 7, true),
  ('What is the difference between freehold and leasehold property?', 'Freehold ownership gives you full ownership of the property and land indefinitely. Leasehold means you own the property for a fixed term, typically 99 years. Most expat-friendly areas in Dubai offer freehold ownership.', 'General', 8, true)
ON CONFLICT (id) DO NOTHING;
