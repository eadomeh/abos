CREATE OR REPLACE FUNCTION public.record_initial_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  IF COALESCE(NEW.stock_quantity, 0) > 0 THEN
    INSERT INTO public.inventory_movements (
      business_id,
      product_id,
      quantity_change,
      quantity_before,
      quantity_after,
      reason,
      note,
      created_by
    )
    VALUES (
      NEW.business_id,
      NEW.id,
      NEW.stock_quantity,
      0,
      NEW.stock_quantity,
      'initial',
      'Initial product stock',
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_record_initial_stock ON public.products;

CREATE TRIGGER products_record_initial_stock
AFTER INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.record_initial_product_stock();

REVOKE ALL ON FUNCTION public.record_initial_product_stock() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_initial_product_stock() TO authenticated;
