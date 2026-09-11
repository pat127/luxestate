-- Fix RLS policies: replace FOR ALL with explicit per-operation policies
-- This ensures INSERT, UPDATE, DELETE all work correctly for the public/anon role

-- ─── Properties ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "properties_public_read" ON public.properties;
DROP POLICY IF EXISTS "properties_open_write" ON public.properties;

CREATE POLICY "properties_select"
  ON public.properties FOR SELECT TO public USING (true);

CREATE POLICY "properties_insert"
  ON public.properties FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "properties_update"
  ON public.properties FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "properties_delete"
  ON public.properties FOR DELETE TO public USING (true);

-- ─── Projects ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "projects_public_read" ON public.projects;
DROP POLICY IF EXISTS "projects_open_write" ON public.projects;

CREATE POLICY "projects_select"
  ON public.projects FOR SELECT TO public USING (true);

CREATE POLICY "projects_insert"
  ON public.projects FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "projects_update"
  ON public.projects FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "projects_delete"
  ON public.projects FOR DELETE TO public USING (true);

-- ─── Leads ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "leads_public_read" ON public.leads;
DROP POLICY IF EXISTS "leads_open_write" ON public.leads;

CREATE POLICY "leads_select"
  ON public.leads FOR SELECT TO public USING (true);

CREATE POLICY "leads_insert"
  ON public.leads FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "leads_update"
  ON public.leads FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "leads_delete"
  ON public.leads FOR DELETE TO public USING (true);
