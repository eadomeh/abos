
create table if not exists public.conversation_ai_state (
  conversation_id uuid primary key references public.conversations(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  detected_language text,
  language_confidence numeric check (language_confidence between 0 and 1),
  current_intent text,
  intent_confidence numeric check (intent_confidence between 0 and 1),
  conversation_summary text,
  customer_signals jsonb not null default '{}'::jsonb,
  pending_actions jsonb not null default '[]'::jsonb,
  last_response_id text,
  last_analyzed_message_id uuid references public.messages(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_agent_runs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  trigger text not null default 'manual',
  input_message_id uuid references public.messages(id) on delete set null,
  model text,
  status text not null default 'started' check (status in ('started','completed','failed')),
  intent text,
  language text,
  tool_calls jsonb not null default '[]'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists conversation_ai_state_business_idx on public.conversation_ai_state(business_id);
create index if not exists ai_agent_runs_business_created_idx on public.ai_agent_runs(business_id, started_at desc);
create index if not exists ai_agent_runs_conversation_created_idx on public.ai_agent_runs(conversation_id, started_at desc);

create or replace function public.abos_touch_ai_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists conversation_ai_state_touch_updated_at on public.conversation_ai_state;
create trigger conversation_ai_state_touch_updated_at
before update on public.conversation_ai_state
for each row execute function public.abos_touch_ai_state();

alter table public.conversation_ai_state enable row level security;
alter table public.ai_agent_runs enable row level security;

drop policy if exists conversation_ai_state_select on public.conversation_ai_state;
create policy conversation_ai_state_select on public.conversation_ai_state
for select using (private.is_business_member(business_id));
drop policy if exists conversation_ai_state_insert on public.conversation_ai_state;
create policy conversation_ai_state_insert on public.conversation_ai_state
for insert with check (private.is_business_member(business_id));
drop policy if exists conversation_ai_state_update on public.conversation_ai_state;
create policy conversation_ai_state_update on public.conversation_ai_state
for update using (private.is_business_member(business_id))
with check (private.is_business_member(business_id));

drop policy if exists ai_agent_runs_select on public.ai_agent_runs;
create policy ai_agent_runs_select on public.ai_agent_runs
for select using (private.is_business_member(business_id));
drop policy if exists ai_agent_runs_insert on public.ai_agent_runs;
create policy ai_agent_runs_insert on public.ai_agent_runs
for insert with check (private.is_business_member(business_id));

create index if not exists ai_agent_runs_input_message_idx on public.ai_agent_runs(input_message_id);
