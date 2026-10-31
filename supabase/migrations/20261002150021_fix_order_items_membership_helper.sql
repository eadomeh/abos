
CREATE OR REPLACE FUNCTION private.is_order_business_member(check_order_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE public.orders.id = check_order_id
      AND private.is_business_member(public.orders.business_id)
  );
$$;
