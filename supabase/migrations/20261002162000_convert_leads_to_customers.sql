CREATE OR REPLACE FUNCTION public.convert_lead_to_customer(p_lead_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_lead public.leads%ROWTYPE;
  v_customer public.customers%ROWTYPE;
  v_created boolean := false;
BEGIN
  SELECT * INTO v_lead
  FROM public.leads
  WHERE id = p_lead_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  IF NOT private.is_business_member(v_lead.business_id) THEN
    RAISE EXCEPTION 'Not authorized for this business';
  END IF;

  IF v_lead.customer_id IS NOT NULL THEN
    SELECT * INTO v_customer
    FROM public.customers
    WHERE id = v_lead.customer_id
      AND business_id = v_lead.business_id;

    IF FOUND THEN
      UPDATE public.leads
      SET status = 'won',
          updated_at = now()
      WHERE id = v_lead.id;

      RETURN jsonb_build_object(
        'ok', true,
        'created', false,
        'customer_id', v_customer.id,
        'lead_id', v_lead.id
      );
    END IF;
  END IF;

  IF v_lead.phone IS NOT NULL THEN
    SELECT * INTO v_customer
    FROM public.customers
    WHERE business_id = v_lead.business_id
      AND phone = v_lead.phone
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF NOT FOUND AND v_lead.email IS NOT NULL THEN
    SELECT * INTO v_customer
    FROM public.customers
    WHERE business_id = v_lead.business_id
      AND lower(email) = lower(v_lead.email)
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    INSERT INTO public.customers (
      business_id,
      name,
      phone,
      email,
      notes
    )
    VALUES (
      v_lead.business_id,
      v_lead.name,
      NULLIF(trim(COALESCE(v_lead.phone, '')), ''),
      NULLIF(trim(COALESCE(v_lead.email, '')), ''),
      NULLIF(trim(COALESCE(v_lead.notes, '')), '')
    )
    RETURNING * INTO v_customer;

    v_created := true;
  END IF;

  UPDATE public.leads
  SET customer_id = v_customer.id,
      status = 'won',
      updated_at = now()
  WHERE id = v_lead.id;

  INSERT INTO public.activity_events (
    business_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    payload
  )
  VALUES (
    v_lead.business_id,
    auth.uid(),
    'lead_converted',
    'lead',
    v_lead.id,
    jsonb_build_object(
      'customer_id', v_customer.id,
      'created_customer', v_created
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'created', v_created,
    'customer_id', v_customer.id,
    'lead_id', v_lead.id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.convert_lead_to_customer(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convert_lead_to_customer(uuid) TO authenticated;
