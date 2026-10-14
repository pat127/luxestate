-- ─── Properties Table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  reference_number TEXT,
  availability  TEXT DEFAULT 'Available',
  completion    TEXT DEFAULT 'Ready',
  description   TEXT,
  property_type TEXT DEFAULT 'Apartment',
  listing_type  TEXT DEFAULT 'For Sale',
  price_aed     TEXT,
  price_per_sqft TEXT,
  service_charge TEXT,
  bedrooms      TEXT,
  bathrooms     TEXT,
  area_sqft     TEXT,
  built_up_area TEXT,
  plot_area     TEXT,
  furnishing    TEXT,
  view_type     TEXT,
  balcony       BOOLEAN DEFAULT false,
  maid_room     BOOLEAN DEFAULT false,
  study_room    BOOLEAN DEFAULT false,
  private_pool  BOOLEAN DEFAULT false,
  private_garden BOOLEAN DEFAULT false,
  amenities     TEXT,
  featured      BOOLEAN DEFAULT false,
  published     BOOLEAN DEFAULT false,
  emirate       TEXT DEFAULT 'Dubai',
  location_area TEXT,
  community     TEXT,
  full_address  TEXT,
  latitude      TEXT,
  longitude     TEXT,
  image_urls    TEXT,
  video_url     TEXT,
  virtual_tour_url TEXT,
  agent_name    TEXT,
  agent_phone   TEXT,
  agent_email   TEXT,
  prop_category TEXT DEFAULT 'Residential',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_published ON public.properties(published);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "properties_public_read" ON public.properties;
CREATE POLICY "properties_public_read"
  ON public.properties FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "properties_open_write" ON public.properties;
CREATE POLICY "properties_open_write"
  ON public.properties FOR ALL TO public USING (true) WITH CHECK (true);

-- ─── Projects Table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  developer           TEXT,
  description         TEXT,
  project_type        TEXT DEFAULT 'Off-Plan',
  status              TEXT DEFAULT 'Active',
  starting_price      TEXT,
  handover_date       TEXT,
  featured            BOOLEAN DEFAULT false,
  published           BOOLEAN DEFAULT false,
  international       BOOLEAN DEFAULT false,
  country             TEXT,
  total_units         INTEGER DEFAULT 0,
  available_units     INTEGER DEFAULT 0,
  sold_units          INTEGER DEFAULT 0,
  min_bedrooms        INTEGER DEFAULT 0,
  max_bedrooms        INTEGER DEFAULT 6,
  size_range          TEXT,
  property_types      TEXT[],
  amenities           TEXT[],
  unit_types          JSONB DEFAULT '[]'::jsonb,
  emirate             TEXT DEFAULT 'Dubai',
  location_area       TEXT,
  community           TEXT,
  sub_community       TEXT,
  full_address        TEXT,
  latitude            TEXT,
  longitude           TEXT,
  payment_plan_summary TEXT,
  post_handover_plan  TEXT,
  milestones          JSONB DEFAULT '[]'::jsonb,
  images              JSONB DEFAULT '[]'::jsonb,
  floor_plans         JSONB DEFAULT '[]'::jsonb,
  master_plan_url     TEXT,
  video_url           TEXT,
  virtual_tour_url    TEXT,
  brochure_url        TEXT,
  factsheet_url       TEXT,
  price_list_url      TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_public_read" ON public.projects;
CREATE POLICY "projects_public_read"
  ON public.projects FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "projects_open_write" ON public.projects;
CREATE POLICY "projects_open_write"
  ON public.projects FOR ALL TO public USING (true) WITH CHECK (true);

-- ─── Leads Table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT,
  phone          TEXT,
  whatsapp       TEXT,
  source         TEXT DEFAULT 'Website',
  status         TEXT DEFAULT 'New',
  budget         TEXT,
  interest       TEXT,
  nationality    TEXT,
  assigned_agent TEXT,
  notes          TEXT,
  follow_up_date TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_public_read" ON public.leads;
CREATE POLICY "leads_public_read"
  ON public.leads FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "leads_open_write" ON public.leads;
CREATE POLICY "leads_open_write"
  ON public.leads FOR ALL TO public USING (true) WITH CHECK (true);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_properties_updated_at ON public.properties;
CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
