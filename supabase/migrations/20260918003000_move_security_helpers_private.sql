-- Move internal SECURITY DEFINER helpers out of the PostgREST-exposed public schema.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

ALTER FUNCTION public.is_business_member(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_business_owner(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_order_business_member(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_conversation_business_member(uuid) SET SCHEMA private;
ALTER FUNCTION public.get_user_id_by_email(text) SET SCHEMA private;

GRANT EXECUTE ON FUNCTION private.is_business_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_business_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_order_business_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_conversation_business_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_id_by_email(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION private.is_business_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.is_business_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.is_order_business_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.is_conversation_business_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.get_user_id_by_email(text) FROM PUBLIC, anon;
