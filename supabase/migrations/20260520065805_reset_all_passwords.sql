-- Reset all user passwords to Cove123
-- This uses the pgcrypto extension to hash the password the same way Supabase auth does.
-- Supabase stores passwords as bcrypt hashes in auth.users.encrypted_password.

DO $$
DECLARE
  new_password TEXT := 'Cove123';
  new_hash TEXT;
BEGIN
  -- Generate bcrypt hash for the new password
  new_hash := crypt(new_password, gen_salt('bf'));

  -- Update all users in auth.users
  UPDATE auth.users
  SET
    encrypted_password = new_hash,
    updated_at = now()
  WHERE encrypted_password IS NOT NULL;

  RAISE NOTICE 'All user passwords have been reset to Cove123';
END;
$$;
