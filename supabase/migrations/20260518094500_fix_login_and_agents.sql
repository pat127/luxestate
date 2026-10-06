-- ============================================================
-- Fix login for 3 team accounts + enhance agents table for
-- multi-agent signup support
-- ============================================================

-- ── 1. Fix / re-create the 3 team accounts ───────────────────────────────────
-- Uses DELETE + INSERT pattern to avoid ON CONFLICT issues with auth.users

DO $$
DECLARE
  ceo_uuid   UUID;
  admin_uuid UUID;
  mkt_uuid   UUID;
BEGIN

  -- ── CEO ──────────────────────────────────────────────────────────────────
  SELECT id INTO ceo_uuid FROM auth.users WHERE email = 'sales@coveestate.com' LIMIT 1;

  IF ceo_uuid IS NULL THEN
    ceo_uuid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
      is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at, email_change_token_new, email_change,
      email_change_sent_at, email_change_token_current, email_change_confirm_status,
      reauthentication_token, reauthentication_sent_at, phone, phone_change,
      phone_change_token, phone_change_sent_at
    ) VALUES (
      ceo_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'sales@coveestate.com', crypt('Ceo@Luxe2026!', gen_salt('bf', 10)), now(), now(), now(),
      jsonb_build_object('full_name', 'CEO', 'role', 'super_admin', 'agent_name', 'CEO'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
      false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    );
  ELSE
    -- Update password and confirm email for existing user
    UPDATE auth.users SET
      encrypted_password = crypt('Ceo@Luxe2026!', gen_salt('bf', 10)),
      email_confirmed_at = now(),
      raw_user_meta_data = jsonb_build_object('full_name', 'CEO', 'role', 'super_admin', 'agent_name', 'CEO'),
      updated_at = now()
    WHERE id = ceo_uuid;
  END IF;

  -- Ensure user_profiles row exists for CEO
  INSERT INTO public.user_profiles (id, email, full_name, role, agent_name)
  VALUES (ceo_uuid, 'sales@coveestate.com', 'CEO', 'super_admin', 'CEO')
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    full_name = 'CEO'
  ;

  -- ── Admin ─────────────────────────────────────────────────────────────────
  SELECT id INTO admin_uuid FROM auth.users WHERE email = 'admin@coveestate.com' LIMIT 1;

  IF admin_uuid IS NULL THEN
    admin_uuid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
      is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at, email_change_token_new, email_change,
      email_change_sent_at, email_change_token_current, email_change_confirm_status,
      reauthentication_token, reauthentication_sent_at, phone, phone_change,
      phone_change_token, phone_change_sent_at
    ) VALUES (
      admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'admin@coveestate.com', crypt('Admin@Luxe2026!', gen_salt('bf', 10)), now(), now(), now(),
      jsonb_build_object('full_name', 'Admin', 'role', 'admin', 'agent_name', 'Admin'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
      false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('Admin@Luxe2026!', gen_salt('bf', 10)),
      email_confirmed_at = now(),
      raw_user_meta_data = jsonb_build_object('full_name', 'Admin', 'role', 'admin', 'agent_name', 'Admin'),
      updated_at = now()
    WHERE id = admin_uuid;
  END IF;

  INSERT INTO public.user_profiles (id, email, full_name, role, agent_name)
  VALUES (admin_uuid, 'admin@coveestate.com', 'Admin', 'admin', 'Admin')
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Admin'
  ;

  -- ── Marketing ─────────────────────────────────────────────────────────────
  SELECT id INTO mkt_uuid FROM auth.users WHERE email = 'marketing@coveestate.com' LIMIT 1;

  IF mkt_uuid IS NULL THEN
    mkt_uuid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
      is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at, email_change_token_new, email_change,
      email_change_sent_at, email_change_token_current, email_change_confirm_status,
      reauthentication_token, reauthentication_sent_at, phone, phone_change,
      phone_change_token, phone_change_sent_at
    ) VALUES (
      mkt_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'marketing@coveestate.com', crypt('Mkt@Luxe2026!', gen_salt('bf', 10)), now(), now(), now(),
      jsonb_build_object('full_name', 'Marketing', 'role', 'marketing', 'agent_name', 'Marketing'),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
      false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('Mkt@Luxe2026!', gen_salt('bf', 10)),
      email_confirmed_at = now(),
      raw_user_meta_data = jsonb_build_object('full_name', 'Marketing', 'role', 'marketing', 'agent_name', 'Marketing'),
      updated_at = now()
    WHERE id = mkt_uuid;
  END IF;

  INSERT INTO public.user_profiles (id, email, full_name, role, agent_name)
  VALUES (mkt_uuid, 'marketing@coveestate.com', 'Marketing', 'marketing', 'Marketing')
  ON CONFLICT (id) DO UPDATE SET
    role = 'marketing',
    full_name = 'Marketing'
  ;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Account fix error: %', SQLERRM;
END $$;


-- ── 2. Enhance agents table for multi-agent auth support ─────────────────────
-- Add auth_user_id column to link agents to auth.users (for agents who sign up)

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_url   TEXT,
  ADD COLUMN IF NOT EXISTS is_active    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS invited_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_at   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_agents_auth_user_id ON public.agents(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_active    ON public.agents(is_active);

-- ── 3. RLS: allow agents to read/update their own row ────────────────────────

DROP POLICY IF EXISTS "open_access_agents" ON public.agents;

-- Admins have full access
DROP POLICY IF EXISTS "admins_full_access_agents" ON public.agents;
CREATE POLICY "admins_full_access_agents"
  ON public.agents
  FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Agents can read all agent rows (needed for dropdowns / assignment)
DROP POLICY IF EXISTS "agents_read_agents" ON public.agents;
CREATE POLICY "agents_read_agents"
  ON public.agents
  FOR SELECT
  TO authenticated
  USING (true);

-- Agents can update only their own row
DROP POLICY IF EXISTS "agents_update_own" ON public.agents;
CREATE POLICY "agents_update_own"
  ON public.agents
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Public (anon) cannot access agents table
-- (no anon policy = blocked by default)


-- ── 4. Function: register a new agent (called by admin) ──────────────────────
-- Creates auth.users entry + user_profiles + agents row in one transaction

CREATE OR REPLACE FUNCTION public.register_agent(
  p_email      TEXT,
  p_password   TEXT,
  p_full_name  TEXT,
  p_phone      TEXT DEFAULT '',
  p_license_no TEXT DEFAULT NULL,
  p_nationality TEXT DEFAULT NULL,
  p_specialization TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_agent_uuid UUID;
  v_existing   UUID;
BEGIN
  -- Check if auth user already exists
  SELECT id INTO v_existing FROM auth.users WHERE email = p_email LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'An account with email % already exists', p_email;
  END IF;

  v_agent_uuid := gen_random_uuid();

  -- Create auth user
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES (
    v_agent_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf', 10)), now(), now(), now(),
    jsonb_build_object('full_name', p_full_name, 'role', 'agent', 'agent_name', p_full_name),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
    false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
  );

  -- user_profiles row created by trigger (handle_new_user)
  -- But ensure it exists in case trigger already ran or didn't
  INSERT INTO public.user_profiles (id, email, full_name, role, agent_name)
  VALUES (v_agent_uuid, p_email, p_full_name, 'agent', p_full_name)
  ON CONFLICT (id) DO NOTHING;

  -- Create agents row
  INSERT INTO public.agents (
    id, name, email, phone, role, agent_status,
    auth_user_id, license_no, nationality, specialization,
    joined, is_active
  ) VALUES (
    gen_random_uuid(), p_full_name, p_email, p_phone, 'Agent', 'Active',
    v_agent_uuid, p_license_no, p_nationality, p_specialization,
    to_char(now(), 'Mon YYYY'), true
  );

  RETURN v_agent_uuid;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$func$;
