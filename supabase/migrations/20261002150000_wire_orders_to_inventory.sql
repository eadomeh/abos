CREATE OR REPLACE FUNCTION public.complete_order(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_product public.products%ROWTYPE;
  v_product_id uuid;
  v_quantity integer;
  v_before integer;
  v_after integer;
  v_items_count integer := 0;
BEGIN
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF NOT private.is_business_member(v_order.business_id) THEN
    RAISE EXCEPTION 'Not authorized for this business';
  END IF;

  IF v_order.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending orders can be completed';
  END IF;

  FOR v_product_id IN
    SELECT DISTINCT oi.product_id
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.product_id IS NOT NULL
    ORDER BY oi.product_id
  LOOP
    SELECT *
    INTO v_product
    FROM public.products
    WHERE id = v_product_id
      AND business_id = v_order.business_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product on order was not found in this business';
    END IF;

    SELECT COALESCE(SUM(oi.quantity), 0)
    INTO v_quantity
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.product_id = v_product_id;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Order contains invalid quantity for product %', v_product.name;
    END IF;

    v_before := COALESCE(v_product.stock_quantity, 0);
    v_after := v_before - v_quantity;

    IF v_after < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for % (available %, requested %)',
        v_product.name, v_before, v_quantity;
    END IF;

    UPDATE public.products
    SET stock_quantity = v_after,
        updated_at = now()
    WHERE id = v_product_id;

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
      v_order.business_id,
      v_product_id,
      -v_quantity,
      v_before,
      v_after,
      'sale',
      'order',
      p_order_id,
      'Stock deducted when order completed',
      auth.uid()
    );

    v_items_count := v_items_count + 1;
  END LOOP;

  PERFORM set_config('abos.internal_order_transition', '1', true);

  UPDATE public.orders
  SET status = 'completed',
      updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'ok', true,
    'order_id', p_order_id,
    'status', 'completed',
    'inventory_products_updated', v_items_count
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF NOT private.is_business_member(v_order.business_id) THEN
    RAISE EXCEPTION 'Not authorized for this business';
  END IF;

  IF v_order.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending orders can be cancelled';
  END IF;

  PERFORM set_config('abos.internal_order_transition', '1', true);

  UPDATE public.orders
  SET status = 'cancelled',
      updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'ok', true,
    'order_id', p_order_id,
    'status', 'cancelled'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF current_setting('abos.internal_order_transition', true) = '1' THEN
    IF NOT (
      OLD.status = 'pending'
      AND NEW.status IN ('completed', 'cancelled')
    ) THEN
      RAISE EXCEPTION 'Invalid order status transition';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Order status transitions must use ABOS order workflow';
END;
$$;

DROP TRIGGER IF EXISTS enforce_order_status_transition ON public.orders;

CREATE TRIGGER enforce_order_status_transition
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_order_status_transition();

REVOKE ALL ON FUNCTION public.complete_order(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order(uuid) TO authenticated;
