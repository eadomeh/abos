ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost_price numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_price_nonnegative;

ALTER TABLE public.products
  ADD CONSTRAINT products_price_nonnegative CHECK (price >= 0);

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_cost_price_nonnegative;

ALTER TABLE public.products
  ADD CONSTRAINT products_cost_price_nonnegative CHECK (cost_price >= 0);

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_stock_quantity_nonnegative;

ALTER TABLE public.products
  ADD CONSTRAINT products_stock_quantity_nonnegative CHECK (stock_quantity >= 0);

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_low_stock_threshold_nonnegative;

ALTER TABLE public.products
  ADD CONSTRAINT products_low_stock_threshold_nonnegative CHECK (low_stock_threshold >= 0);

CREATE INDEX IF NOT EXISTS idx_products_business_category
  ON public.products(business_id, category);

CREATE INDEX IF NOT EXISTS idx_products_low_stock
  ON public.products(business_id, stock_quantity, low_stock_threshold)
  WHERE is_active = true;

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_change integer NOT NULL CHECK (quantity_change <> 0),
  quantity_before integer NOT NULL CHECK (quantity_before >= 0),
  quantity_after integer NOT NULL CHECK (quantity_after >= 0),
  reason text NOT NULL CHECK (
    reason IN ('initial','sale','restock','adjustment','return','damage','correction')
  ),
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_inventory_movements_business_created
  ON public.inventory_movements(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_created
  ON public.inventory_movements(product_id, created_at DESC);

DROP POLICY IF EXISTS "select_inventory_movements" ON public.inventory_movements;
CREATE POLICY "select_inventory_movements"
  ON public.inventory_movements
  FOR SELECT
  TO authenticated
  USING (private.is_business_member(business_id));

DROP POLICY IF EXISTS "insert_inventory_movements" ON public.inventory_movements;
CREATE POLICY "insert_inventory_movements"
  ON public.inventory_movements
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_business_member(business_id));

CREATE OR REPLACE FUNCTION public.adjust_product_stock(
  p_product_id uuid,
  p_quantity_change integer,
  p_reason text,
  p_note text DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL
)
RETURNS public.inventory_movements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_before integer;
  v_after integer;
  v_movement public.inventory_movements;
BEGIN
  IF p_quantity_change = 0 THEN
    RAISE EXCEPTION 'Quantity change cannot be zero';
  END IF;

  IF p_reason NOT IN ('initial','sale','restock','adjustment','return','damage','correction') THEN
    RAISE EXCEPTION 'Invalid inventory movement reason';
  END IF;

  SELECT *
  INTO v_product
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF NOT private.is_business_member(v_product.business_id) THEN
    RAISE EXCEPTION 'Not authorized for this business';
  END IF;

  v_before := COALESCE(v_product.stock_quantity, 0);
  v_after := v_before + p_quantity_change;

  IF v_after < 0 THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  UPDATE public.products
  SET stock_quantity = v_after,
      updated_at = now()
  WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (
    business_id,
    product_id,
    quantity_change,
    quantity_before,
    quantity_after,
    reason,
    reference_type,
    reference_id,
    note,
    created_by
  )
  VALUES (
    v_product.business_id,
    p_product_id,
    p_quantity_change,
    v_before,
    v_after,
    p_reason,
    p_reference_type,
    p_reference_id,
    p_note,
    auth.uid()
  )
  RETURNING * INTO v_movement;

  RETURN v_movement;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_product_stock(uuid, integer, text, text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(uuid, integer, text, text, text, uuid) TO authenticated;
