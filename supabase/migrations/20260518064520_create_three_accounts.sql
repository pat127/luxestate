-- ============================================================
-- Create 3 team accounts: CEO, Admin, Marketing
-- Emails: sales@coveestate.com, admin@coveestate.com, marketing@coveestate.com
-- ============================================================

DO $$
DECLARE
  ceo_uuid   UUID := gen_random_uuid();
  admin_uuid UUID := gen_random_uuid();
  mkt_uuid   UUID := gen_random_uuid();
BEGIN

  -- CEO (sales@coveestate.com)
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
  ) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('Ceo@Luxe2026!', gen_salt('bf', 10)),
    raw_user_meta_data = jsonb_build_object('full_name', 'CEO', 'role', 'super_admin', 'agent_name', 'CEO'),
    email_confirmed_at = now(),
    updated_at = now();

  -- Admin (admin@coveestate.com)
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
  ) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('Admin@Luxe2026!', gen_salt('bf', 10)),
    raw_user_meta_data = jsonb_build_object('full_name', 'Admin', 'role', 'admin', 'agent_name', 'Admin'),
    email_confirmed_at = now(),
    updated_at = now();

  -- Marketing (marketing@coveestate.com)
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
  ) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('Mkt@Luxe2026!', gen_salt('bf', 10)),
    raw_user_meta_data = jsonb_build_object('full_name', 'Marketing', 'role', 'marketing', 'agent_name', 'Marketing'),
    email_confirmed_at = now(),
    updated_at = now();

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Account creation error: %', SQLERRM;
END $$;
