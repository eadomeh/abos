alter table public.conversation_ai_state
  add column if not exists urgency text,
  add column if not exists sales_stage text,
  add column if not exists next_best_action text,
  add column if not exists last_customer_message_at timestamptz;

alter table public.ai_agent_runs
  add column if not exists latency_ms integer,
  add column if not exists usage jsonb;

create index if not exists idx_conversation_ai_state_business_intent
  on public.conversation_ai_state (business_id, current_intent);

create index if not exists idx_ai_agent_runs_business_finished
  on public.ai_agent_runs (business_id, finished_at desc);