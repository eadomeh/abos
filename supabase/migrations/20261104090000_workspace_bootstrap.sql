-- A3: authenticated, RLS-respecting workspace dashboard bootstrap.
-- SECURITY INVOKER is intentional: table grants and business-scoped RLS remain in force.
CREATE OR REPLACE FUNCTION public.get_workspace_bootstrap(
  p_business_id uuid,
  p_now timestamptz,
  p_day_start timestamptz,
  p_thirty_days_ago timestamptz,
  p_seven_days_ago timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF (SELECT auth.uid()) IS NULL
     OR NOT private.is_business_member(p_business_id) THEN
    RAISE EXCEPTION 'Not authorized for this business workspace'
      USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'stats', jsonb_build_object(
      'revenue30d', COALESCE((
        SELECT SUM(o.total_amount)
        FROM public.orders o
        WHERE o.business_id = p_business_id
          AND o.created_at >= p_thirty_days_ago
          AND o.status = 'completed'
      ), 0),
      'revenueToday', COALESCE((
        SELECT SUM(o.total_amount)
        FROM public.orders o
        WHERE o.business_id = p_business_id
          AND o.created_at >= p_day_start
          AND o.created_at <= p_now
          AND o.status = 'completed'
      ), 0),
      'orders30d', (
        SELECT COUNT(*)
        FROM public.orders o
        WHERE o.business_id = p_business_id
          AND o.created_at >= p_thirty_days_ago
      ),
      'customers30d', (
        SELECT COUNT(*)
        FROM public.customers c
        WHERE c.business_id = p_business_id
          AND c.created_at >= p_thirty_days_ago
      ),
      'conversations', (
        SELECT COUNT(*)
        FROM public.conversations c
        WHERE c.business_id = p_business_id
          AND c.kind = 'customer'
      ),
      'unread', (
        SELECT COUNT(*)
        FROM public.conversations c
        WHERE c.business_id = p_business_id
          AND c.kind = 'customer'
          AND c.unread_count > 0
      ),
      'openLeads', (
        SELECT COUNT(*)
        FROM public.leads l
        WHERE l.business_id = p_business_id
          AND l.status IN ('new', 'contacted', 'qualified')
      ),
      'pipelineValue', COALESCE((
        SELECT SUM(l.estimated_value)
        FROM public.leads l
        WHERE l.business_id = p_business_id
          AND l.status IN ('new', 'contacted', 'qualified')
      ), 0),
      'openTasks', (
        SELECT COUNT(*)
        FROM public.tasks t
        WHERE t.business_id = p_business_id
          AND t.status <> 'done'
      ),
      'dueToday', (
        SELECT COUNT(*)
        FROM public.tasks t
        WHERE t.business_id = p_business_id
          AND t.due_at >= p_day_start
          AND t.due_at < p_day_start + INTERVAL '1 day'
          AND t.status <> 'done'
      ),
      'lowStock', (
        SELECT COUNT(*)
        FROM public.products p
        WHERE p.business_id = p_business_id
          AND p.is_active = true
          AND p.stock_quantity <= 5
      )
    ),
    'trend', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('key', daily.day_key, 'amount', daily.amount)
        ORDER BY daily.day_key
      )
      FROM (
        SELECT
          to_char(o.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day_key,
          SUM(o.total_amount) AS amount
        FROM public.orders o
        WHERE o.business_id = p_business_id
          AND o.status = 'completed'
          AND o.created_at >= p_seven_days_ago
          AND o.created_at <= p_now
        GROUP BY 1
      ) AS daily
    ), '[]'::jsonb),
    'recentOrders', COALESCE((
      SELECT jsonb_agg(to_jsonb(recent_order) ORDER BY recent_order.created_at DESC)
      FROM (
        SELECT o.id, o.total_amount, o.status, o.created_at
        FROM public.orders o
        WHERE o.business_id = p_business_id
        ORDER BY o.created_at DESC
        LIMIT 5
      ) AS recent_order
    ), '[]'::jsonb),
    'recentConvos', COALESCE((
      SELECT jsonb_agg(to_jsonb(recent_convo) ORDER BY recent_convo.last_message_at DESC NULLS LAST)
      FROM (
        SELECT c.id, c.customer_name, c.last_message_preview,
               c.last_message_at, c.unread_count
        FROM public.conversations c
        WHERE c.business_id = p_business_id
          AND c.kind = 'customer'
        ORDER BY c.last_message_at DESC NULLS LAST
        LIMIT 5
      ) AS recent_convo
    ), '[]'::jsonb),
    'activities', COALESCE((
      SELECT jsonb_agg(to_jsonb(recent_activity) ORDER BY recent_activity.created_at DESC)
      FROM (
        SELECT a.id, a.event_type, a.entity_type, a.created_at, a.payload
        FROM public.activity_events a
        WHERE a.business_id = p_business_id
        ORDER BY a.created_at DESC
        LIMIT 8
      ) AS recent_activity
    ), '[]'::jsonb),
    'insights', COALESCE((
      SELECT jsonb_agg(to_jsonb(recent_insight) ORDER BY recent_insight.created_at DESC)
      FROM (
        SELECT i.id, i.title, i.summary, i.severity, i.created_at, i.expires_at
        FROM public.ai_insights i
        WHERE i.business_id = p_business_id
          AND i.is_dismissed = false
        ORDER BY i.created_at DESC
        LIMIT 5
      ) AS recent_insight
    ), '[]'::jsonb)
  ) INTO result;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$function$;

REVOKE ALL ON FUNCTION public.get_workspace_bootstrap(
  uuid, timestamptz, timestamptz, timestamptz, timestamptz
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_workspace_bootstrap(
  uuid, timestamptz, timestamptz, timestamptz, timestamptz
) TO authenticated;
