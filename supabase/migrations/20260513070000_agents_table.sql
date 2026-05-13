-- Agents Module Migration
-- Creates agents table and seeds default agents including CEO

-- ── 1. Table ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'Agent',
  agent_status TEXT NOT NULL DEFAULT 'Active',
  leads INTEGER NOT NULL DEFAULT 0,
  deals INTEGER NOT NULL DEFAULT 0,
  commission TEXT NOT NULL DEFAULT 'AED 0',
  joined TEXT NOT NULL DEFAULT '',
  nationality TEXT,
  languages TEXT[],
  specialization TEXT,
  license_no TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(agent_status);
CREATE INDEX IF NOT EXISTS idx_agents_email ON public.agents(email);

-- ── 3. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_access_agents" ON public.agents;
CREATE POLICY "open_access_agents"
ON public.agents FOR ALL TO public USING (true) WITH CHECK (true);

-- ── 4. Updated_at trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_agents_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS agents_updated_at ON public.agents;
CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_agents_updated_at();

-- ── 5. Seed default agents ────────────────────────────────────────────────────

DO $$
BEGIN
  -- Only seed if table is empty
  IF NOT EXISTS (SELECT 1 FROM public.agents LIMIT 1) THEN
    INSERT INTO public.agents (name, email, phone, role, agent_status, leads, deals, commission, joined, nationality, languages, specialization, license_no)
    VALUES
      ('CEO Admin',       'ceo@luxestate.com',   '+971 50 886 2683', 'CEO / Senior Agent', 'Active',   0,  0,  'AED 0',       'Jan 2006', 'UAE',     ARRAY['English','Arabic'],          'Luxury Residential', 'RERA-00001'),
      ('Sarah Mitchell',  'sarah@luxestate.com', '+971 50 100 2000', 'Senior Agent',       'Active',  45, 12, 'AED 280,000', 'Jan 2022', 'British', ARRAY['English','French'],          'Luxury Residential', 'RERA-12345'),
      ('James Carter',    'james@luxestate.com', '+971 55 200 3000', 'Agent',              'Active',  32,  8, 'AED 190,000', 'Mar 2022', 'American',ARRAY['English'],                  'Off-Plan',           'RERA-23456'),
      ('Omar Hassan',     'omar@luxestate.com',  '+971 52 300 4000', 'Senior Agent',       'Active',  58, 15, 'AED 420,000', 'Sep 2021', 'Emirati', ARRAY['Arabic','English'],          'Commercial',         'RERA-34567'),
      ('Priya Sharma',    'priya@luxestate.com', '+971 56 400 5000', 'Junior Agent',       'Active',  18,  4, 'AED 85,000',  'Jun 2023', 'Indian',  ARRAY['English','Hindi'],           'Residential',        'RERA-45678'),
      ('Lucas Fontaine',  'lucas@luxestate.com', '+971 58 500 6000', 'Agent',              'Inactive',22,  6, 'AED 140,000', 'Nov 2022', 'French',  ARRAY['French','English'],          'Luxury Residential', 'RERA-56789')
    ON CONFLICT DO NOTHING;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed agents failed: %', SQLERRM;
END $$;
