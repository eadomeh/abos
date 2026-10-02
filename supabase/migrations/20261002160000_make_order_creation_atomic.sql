CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_business_id uuid,
  p_customer_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_total numeric(12,2);
  v_item_count integer;
  v_requested_count integer;
BEGIN
  IF NOT private.is_business_member(p_business_id) THEN
    RAISE EXCEPTION 'Not authorized for this business';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one order item is required';
  END IF;

  SELECT count(*)
  INTO v_requested_count
  FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer);

  IF v_requested_count = 0 THEN
    RAISE EXCEPTION 'At least one order item is required';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
    WHERE quantity IS NULL OR quantity <= 0
  ) THEN
    RAISE EXCEPTION 'Order quantities must be positive whole numbers';
  END IF;

  IF p_customer_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM public.customers c
       WHERE c.id = p_customer_id
         AND c.business_id = p_business_id
     )
  THEN
    RAISE EXCEPTION 'Customer does not belong to this business';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (
      SELECT product_id, SUM(quantity)::integer AS quantity
      FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
      GROUP BY product_id
    ) requested
    LEFT JOIN public.products p
      ON p.id = requested.product_id
     AND p.business_id = p_business_id
     AND p.is_active = true
    WHERE p.id IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more selected products are unavailable';
  END IF;

  SELECT
    SUM(requested.quantity * p.price)::numeric(12,2),
    COUNT(*)
  INTO v_total, v_item_count
  FROM (
    SELECT product_id, SUM(quantity)::integer AS quantity
    FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
    GROUP BY product_id
  ) requested
  JOIN public.products p
    ON p.id = requested.product_id
   AND p.business_id = p_business_id
   AND p.is_active = true;

  INSERT INTO public.orders (
    business_id,
    customer_id,
    status,
    total_amount,
    currency,
    notes,
    order_number
  )
  SELECT
    p_business_id,
    p_customer_id,
    'pending',
    COALESCE(v_total, 0),
    COALESCE(b.currency, 'NGN'),
    NULLIF(trim(COALESCE(p_notes, '')), ''),
    'ORD-' || to_char(now(), 'YYMMDDHH24MISS') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4))
  FROM public.businesses b
  WHERE b.id = p_business_id
  RETURNING * INTO v_order;

  INSERT INTO public.order_items (
    order_id,
    product_id,
    product_name,
    unit_price,
    quantity,
    subtotal
  )
  SELECT
    v_order.id,
    p.id,
    p.name,
    p.price,
    requested.quantity,
    (p.price * requested.quantity)::numeric(12,2)
  FROM (
    SELECT product_id, SUM(quantity)::integer AS quantity
    FROM jsonb_to_recordset(p_items) AS x(product_id uuid, quantity integer)
    GROUP BY product_id
  ) requested
  JOIN public.products p
    ON p.id = requested.product_id
   AND p.business_id = p_business_id
   AND p.is_active = true;

  RETURN jsonb_build_object(
    'ok', true,
    'order', to_jsonb(v_order),
    'items_created', v_item_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_atomic(uuid, uuid, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(uuid, uuid, text, jsonb) TO authenticated;
