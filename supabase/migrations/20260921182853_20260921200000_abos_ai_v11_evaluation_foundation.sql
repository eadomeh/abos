
alter table public.conversation_ai_state
  add column if not exists extracted_entities jsonb not null default '{}'::jsonb;

create table if not exists public.ai_agent_evaluations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  input_message text not null,
  conversation_history jsonb not null default '[]'::jsonb,
  expected_language text,
  expected_intent text,
  expected_entities jsonb not null default '{}'::jsonb,
  expected_action jsonb not null default '{}'::jsonb,
  expected_reply_style text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_agent_evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid references public.ai_agent_evaluations(id) on delete cascade,
  model text,
  predicted_language text,
  predicted_intent text,
  predicted_entities jsonb not null default '{}'::jsonb,
  tool_calls jsonb not null default '[]'::jsonb,
  answer text,
  scores jsonb not null default '{}'::jsonb,
  passed boolean,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.ai_agent_evaluations enable row level security;
alter table public.ai_agent_evaluation_runs enable row level security;

drop policy if exists ai_agent_evaluations_select on public.ai_agent_evaluations;
create policy ai_agent_evaluations_select on public.ai_agent_evaluations
for select using (
  exists (
    select 1
    from public.businesses b
    where b.owner_id = auth.uid()
  )
);

drop policy if exists ai_agent_evaluation_runs_select on public.ai_agent_evaluation_runs;
create policy ai_agent_evaluation_runs_select on public.ai_agent_evaluation_runs
for select using (
  exists (
    select 1
    from public.businesses b
    where b.owner_id = auth.uid()
  )
);

create index if not exists ai_agent_evaluations_category_idx
  on public.ai_agent_evaluations(category, active);

create index if not exists ai_agent_evaluation_runs_evaluation_idx
  on public.ai_agent_evaluation_runs(evaluation_id, created_at desc);
