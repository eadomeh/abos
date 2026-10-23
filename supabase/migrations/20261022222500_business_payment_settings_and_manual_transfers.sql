-- PAY-001: business-scoped payment instructions and audited manual-transfer review.
CREATE TABLE public.business_payment_settings (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  bank_transfer_enabled boolean NOT NULL DEFAULT false,
  bank_name text,
  account_name text,
  account_number text,
  customer_instructions text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_payment_settings_instructions_length
    CHECK (customer_instructions IS NULL OR char_length(customer_instructions) <= 1000),
  CONSTRAINT business_payment_settings_bank_fields_check CHECK (
    NOT bank_transfer_enabled OR (
      char_length(btrim(coalesce(bank_name, ''))) > 0 AND
      char_length(btrim(coalesce(account_name, ''))) > 0 AND
      account_number IS NOT NULL AND btrim(account_number) ~ '^[A-Za-z0-9][A-Za-z0-9 -]{4,32}[A-Za-z0-9]$'
    )
  )
);

ALTER TABLE public.business_payment_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.business_payment_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.business_payment_settings TO authenticated;
CREATE POLICY business_payment_settings_owner_select
  ON public.business_payment_settings FOR SELECT TO authenticated
  USING (private.is_business_owner(business_id));
CREATE POLICY business_payment_settings_owner_insert
  ON public.business_payment_settings FOR INSERT TO authenticated
  WITH CHECK (private.is_business_owner(business_id));
CREATE POLICY business_payment_settings_owner_update
  ON public.business_payment_settings FOR UPDATE TO authenticated
  USING (private.is_business_owner(business_id))
  WITH CHECK (private.is_business_owner(business_id));

CREATE TABLE public.order_payment_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  method text NOT NULL DEFAULT 'manual_bank_transfer'
    CHECK (method = 'manual_bank_transfer'),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected')),
  transfer_reference text,
  report_note text,
  reported_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_payment_reports_reference_length
    CHECK (transfer_reference IS NULL OR char_length(transfer_reference) <= 120),
  CONSTRAINT order_payment_reports_notes_length CHECK (
    (report_note IS NULL OR char_length(report_note) <= 500) AND
    (review_note IS NULL OR char_length(review_note) <= 500)
  ),
  CONSTRAINT order_payment_reports_review_state_check CHECK (
    (status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL) OR
    (status IN ('verified', 'rejected') AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
  )
);
CREATE INDEX order_payment_reports_business_created_idx
  ON public.order_payment_reports (business_id, created_at DESC);
CREATE INDEX order_payment_reports_order_created_idx
  ON public.order_payment_reports (order_id, created_at DESC);
CREATE UNIQUE INDEX order_payment_reports_one_pending_per_order
  ON public.order_payment_reports (order_id) WHERE status = 'pending';
CREATE UNIQUE INDEX order_payment_reports_one_verified_per_order
  ON public.order_payment_reports (order_id) WHERE status = 'verified';

ALTER TABLE public.order_payment_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.order_payment_reports FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.order_payment_reports TO authenticated;
CREATE POLICY order_payment_reports_member_select
  ON public.order_payment_reports FOR SELECT TO authenticated
  USING (private.is_business_member(business_id));

CREATE OR REPLACE FUNCTION public.record_manual_bank_transfer(
  p_order_id uuid,
  p_transfer_reference text DEFAULT NULL,
  p_report_note text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_business_currency text;
  v_enabled boolean;
  v_report_id uuid;
  v_reference text := nullif(btrim(p_transfer_reference), '');
  v_note text := nullif(btrim(p_report_note), '');
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF v_reference IS NOT NULL AND char_length(v_reference) > 120 THEN
    RAISE EXCEPTION 'Transfer reference must be 120 characters or fewer';
  END IF;
  IF v_note IS NOT NULL AND char_length(v_note) > 500 THEN
    RAISE EXCEPTION 'Note must be 500 characters or fewer';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF NOT private.has_business_role(v_order.business_id, ARRAY['owner','admin','agent']::text[]) THEN
    RAISE EXCEPTION 'Not authorized to record a transfer claim for this business';
  END IF;
  IF v_order.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending orders can have a transfer claim recorded';
  END IF;

  SELECT bank_transfer_enabled INTO v_enabled
  FROM public.business_payment_settings WHERE business_id = v_order.business_id;
  IF coalesce(v_enabled, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Bank transfer is not enabled in Payment Settings for this business';
  END IF;
  IF EXISTS (SELECT 1 FROM public.order_payment_reports
             WHERE order_id = p_order_id AND status IN ('pending', 'verified')) THEN
    RAISE EXCEPTION 'This order already has a pending or verified transfer report';
  END IF;

  SELECT currency INTO v_business_currency FROM public.businesses WHERE id = v_order.business_id;
  INSERT INTO public.order_payment_reports (
    business_id, order_id, amount, currency, status, transfer_reference,
    report_note, reported_by
  ) VALUES (
    v_order.business_id, v_order.id, v_order.total_amount,
    upper(coalesce(nullif(v_order.currency, ''), nullif(v_business_currency, ''), 'NGN')),
    'pending', v_reference, v_note, auth.uid()
  ) RETURNING id INTO v_report_id;

  INSERT INTO public.activity_events (
    business_id, actor_user_id, event_type, entity_type, entity_id, payload
  ) VALUES (
    v_order.business_id, auth.uid(), 'manual_bank_transfer_reported',
    'order_payment_report', v_report_id,
    jsonb_build_object('order_id', v_order.id, 'amount', v_order.total_amount,
                       'currency', upper(coalesce(nullif(v_order.currency, ''), nullif(v_business_currency, ''), 'NGN')),
                       'status', 'pending', 'transfer_reference_present', v_reference IS NOT NULL)
  );
  RETURN v_report_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_manual_bank_transfer(
  p_payment_id uuid,
  p_decision text,
  p_review_note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  v_report public.order_payment_reports%ROWTYPE;
  v_note text := nullif(btrim(p_review_note), '');
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_decision IS NULL OR p_decision NOT IN ('verified', 'rejected') THEN
    RAISE EXCEPTION 'Decision must be verified or rejected';
  END IF;
  IF v_note IS NOT NULL AND char_length(v_note) > 500 THEN
    RAISE EXCEPTION 'Review note must be 500 characters or fewer';
  END IF;

  SELECT * INTO v_report FROM public.order_payment_reports WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transfer report not found'; END IF;
  IF NOT private.has_business_role(v_report.business_id, ARRAY['owner','admin']::text[]) THEN
    RAISE EXCEPTION 'Only the business owner or admin can verify or reject a transfer';
  END IF;
  IF v_report.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending transfer reports can be reviewed';
  END IF;
  IF p_decision = 'verified' AND EXISTS (
    SELECT 1 FROM public.order_payment_reports
    WHERE order_id = v_report.order_id AND status = 'verified' AND id <> v_report.id
  ) THEN
    RAISE EXCEPTION 'A verified payment already exists for this order';
  END IF;

  UPDATE public.order_payment_reports
  SET status = p_decision, reviewed_by = auth.uid(), reviewed_at = now(),
      review_note = v_note, updated_at = now()
  WHERE id = v_report.id;

  INSERT INTO public.activity_events (
    business_id, actor_user_id, event_type, entity_type, entity_id, payload
  ) VALUES (
    v_report.business_id, auth.uid(),
    CASE WHEN p_decision = 'verified' THEN 'manual_bank_transfer_verified' ELSE 'manual_bank_transfer_rejected' END,
    'order_payment_report', v_report.id,
    jsonb_build_object('order_id', v_report.order_id, 'amount', v_report.amount,
                       'currency', v_report.currency, 'previous_status', 'pending',
                       'new_status', p_decision, 'review_note_present', v_note IS NOT NULL)
  );

  RETURN jsonb_build_object('ok', true, 'payment_id', v_report.id, 'status', p_decision);
END;
$$;
REVOKE ALL ON FUNCTION public.record_manual_bank_transfer(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_manual_bank_transfer(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_manual_bank_transfer(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_manual_bank_transfer(uuid, text, text) TO authenticated;
