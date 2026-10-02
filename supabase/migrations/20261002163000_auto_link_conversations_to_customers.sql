CREATE OR REPLACE FUNCTION public.normalize_phone_digits(p_phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g'), '');
$$;

CREATE OR REPLACE FUNCTION public.link_conversation_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_customer_id uuid;
  v_normalized text;
BEGIN
  IF NEW.customer_id IS NOT NULL OR NEW.customer_phone IS NULL THEN
    RETURN NEW;
  END IF;

  v_normalized := public.normalize_phone_digits(NEW.customer_phone);

  IF v_normalized IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT c.id
  INTO v_customer_id
  FROM public.customers c
  WHERE c.business_id = NEW.business_id
    AND public.normalize_phone_digits(c.phone) = v_normalized
  ORDER BY c.created_at ASC
  LIMIT 1;

  IF v_customer_id IS NOT NULL THEN
    NEW.customer_id := v_customer_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS conversations_link_customer ON public.conversations;

CREATE TRIGGER conversations_link_customer
BEFORE INSERT OR UPDATE OF customer_phone, customer_id
ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.link_conversation_customer();

REVOKE ALL ON FUNCTION public.normalize_phone_digits(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.normalize_phone_digits(text) TO authenticated;

REVOKE ALL ON FUNCTION public.link_conversation_customer() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_conversation_customer() TO authenticated;
