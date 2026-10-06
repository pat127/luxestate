-- Allow anonymous (unauthenticated) users to insert leads from public website forms
-- This enables contact, inquiry, and registration forms to save to the database

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public (anonymous) inserts so website visitors can submit inquiry forms
DROP POLICY IF EXISTS "anon_insert_leads" ON public.leads;
CREATE POLICY "anon_insert_leads"
ON public.leads
FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users (admins) to read and manage all leads
DROP POLICY IF EXISTS "authenticated_manage_leads" ON public.leads;
CREATE POLICY "authenticated_manage_leads"
ON public.leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
