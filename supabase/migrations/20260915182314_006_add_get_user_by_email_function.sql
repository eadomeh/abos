-- Helper function to look up a user ID by email for team invitations
-- SECURITY DEFINER so it can read from auth.users (which is not accessible to authenticated users directly)
CREATE OR REPLACE FUNCTION get_user_id_by_email(email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth
AS $$
  SELECT id FROM auth.users WHERE email = $1 LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION get_user_id_by_email(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO authenticated;