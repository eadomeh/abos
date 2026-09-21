create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  phone text,
  email text,
  source text not null default 'manual' check (source in ('manual','whatsapp','web','instagram','messenger','referral','other')),
  status text not null default 'new' check (status in ('new','contacted','qualified','won','lost')),
  score integer not null default 0 check (score between 0 and 100),
  estimated_value numeric not null default 0,
  notes text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  due_at timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  related_customer_id uuid references public.customers(id) on delete set null,
  related_lead_id uuid references public.leads(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  trigger_type text not null default 'manual',
  trigger_config jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  is_active boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  automation_id uuid references public.automations(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','skipped')),
  trigger_data jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  provider text not null,
  status text not null default 'disconnected' check (status in ('connected','disconnected','error')),
  external_account_id text,
  config jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, provider)
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  insight_type text not null,
  title text not null,
  summary text not null,
  severity text not null default 'info' check (severity in ('info','low','warning','critical')),
  data jsonb not null default '{}'::jsonb,
  period_start timestamptz,
  period_end timestamptz,
  expires_at timestamptz,
  is_dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists leads_business_status_idx on public.leads(business_id, status);
create index if not exists leads_business_created_idx on public.leads(business_id, created_at desc);
create index if not exists tasks_business_status_due_idx on public.tasks(business_id, status, due_at);
create index if not exists notes_business_customer_idx on public.notes(business_id, customer_id);
create index if not exists automations_business_active_idx on public.automations(business_id, is_active);
create index if not exists automation_runs_business_created_idx on public.automation_runs(business_id, created_at desc);
create index if not exists integrations_business_provider_idx on public.integrations(business_id, provider);
create index if not exists activity_events_business_created_idx on public.activity_events(business_id, created_at desc);
create index if not exists ai_insights_business_created_idx on public.ai_insights(business_id, created_at desc);

create or replace function public.abos_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at before update on public.leads for each row execute function public.abos_touch_updated_at();
drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at before update on public.tasks for each row execute function public.abos_touch_updated_at();
drop trigger if exists notes_touch_updated_at on public.notes;
create trigger notes_touch_updated_at before update on public.notes for each row execute function public.abos_touch_updated_at();
drop trigger if exists automations_touch_updated_at on public.automations;
create trigger automations_touch_updated_at before update on public.automations for each row execute function public.abos_touch_updated_at();
drop trigger if exists integrations_touch_updated_at on public.integrations;
create trigger integrations_touch_updated_at before update on public.integrations for each row execute function public.abos_touch_updated_at();

alter table public.leads enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.automations enable row level security;
alter table public.automation_runs enable row level security;
alter table public.integrations enable row level security;
alter table public.activity_events enable row level security;
alter table public.ai_insights enable row level security;

drop policy if exists leads_select on public.leads;
create policy leads_select on public.leads for select using (private.is_business_member(business_id));
drop policy if exists leads_insert on public.leads;
create policy leads_insert on public.leads for insert with check (private.is_business_member(business_id));
drop policy if exists leads_update on public.leads;
create policy leads_update on public.leads for update using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists leads_delete on public.leads;
create policy leads_delete on public.leads for delete using (private.is_business_owner(business_id));

drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks for select using (private.is_business_member(business_id));
drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks for insert with check (private.is_business_member(business_id));
drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks for update using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks for delete using (private.is_business_owner(business_id));

drop policy if exists notes_select on public.notes;
create policy notes_select on public.notes for select using (private.is_business_member(business_id));
drop policy if exists notes_insert on public.notes;
create policy notes_insert on public.notes for insert with check (private.is_business_member(business_id));
drop policy if exists notes_update on public.notes;
create policy notes_update on public.notes for update using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists notes_delete on public.notes;
create policy notes_delete on public.notes for delete using (private.is_business_owner(business_id));

drop policy if exists automations_select on public.automations;
create policy automations_select on public.automations for select using (private.is_business_member(business_id));
drop policy if exists automations_insert on public.automations;
create policy automations_insert on public.automations for insert with check (private.is_business_member(business_id));
drop policy if exists automations_update on public.automations;
create policy automations_update on public.automations for update using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists automations_delete on public.automations;
create policy automations_delete on public.automations for delete using (private.is_business_owner(business_id));

drop policy if exists automation_runs_select on public.automation_runs;
create policy automation_runs_select on public.automation_runs for select using (private.is_business_member(business_id));
drop policy if exists automation_runs_insert on public.automation_runs;
create policy automation_runs_insert on public.automation_runs for insert with check (private.is_business_member(business_id));
drop policy if exists automation_runs_update on public.automation_runs;
create policy automation_runs_update on public.automation_runs for update using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists automation_runs_delete on public.automation_runs;
create policy automation_runs_delete on public.automation_runs for delete using (private.is_business_owner(business_id));

drop policy if exists integrations_select on public.integrations;
create policy integrations_select on public.integrations for select using (private.is_business_member(business_id));
drop policy if exists integrations_insert on public.integrations;
create policy integrations_insert on public.integrations for insert with check (private.is_business_member(business_id));
drop policy if exists integrations_update on public.integrations;
create policy integrations_update on public.integrations for update using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists integrations_delete on public.integrations;
create policy integrations_delete on public.integrations for delete using (private.is_business_owner(business_id));

drop policy if exists activity_events_select on public.activity_events;
create policy activity_events_select on public.activity_events for select using (private.is_business_member(business_id));
drop policy if exists activity_events_insert on public.activity_events;
create policy activity_events_insert on public.activity_events for insert with check (private.is_business_member(business_id));
drop policy if exists activity_events_delete on public.activity_events;
create policy activity_events_delete on public.activity_events for delete using (private.is_business_owner(business_id));

drop policy if exists ai_insights_select on public.ai_insights;
create policy ai_insights_select on public.ai_insights for select using (private.is_business_member(business_id));
drop policy if exists ai_insights_insert on public.ai_insights;
create policy ai_insights_insert on public.ai_insights for insert with check (private.is_business_member(business_id));
drop policy if exists ai_insights_update on public.ai_insights;
create policy ai_insights_update on public.ai_insights for update using (private.is_business_member(business_id)) with check (private.is_business_member(business_id));
drop policy if exists ai_insights_delete on public.ai_insights;
create policy ai_insights_delete on public.ai_insights for delete using (private.is_business_owner(business_id));
