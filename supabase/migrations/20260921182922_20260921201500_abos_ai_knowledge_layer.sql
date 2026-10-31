
create table if not exists public.business_knowledge (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null default 'general',
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_knowledge_business_active_idx
  on public.business_knowledge(business_id, active);

alter table public.business_knowledge enable row level security;

drop policy if exists business_knowledge_select on public.business_knowledge;
create policy business_knowledge_select on public.business_knowledge
for select using (private.is_business_member(business_id));

drop policy if exists business_knowledge_insert on public.business_knowledge;
create policy business_knowledge_insert on public.business_knowledge
for insert with check (private.is_business_member(business_id));

drop policy if exists business_knowledge_update on public.business_knowledge;
create policy business_knowledge_update on public.business_knowledge
for update using (private.is_business_member(business_id))
with check (private.is_business_member(business_id));

drop policy if exists business_knowledge_delete on public.business_knowledge;
create policy business_knowledge_delete on public.business_knowledge
for delete using (private.is_business_owner(business_id));

drop trigger if exists business_knowledge_touch_updated_at on public.business_knowledge;
create trigger business_knowledge_touch_updated_at
before update on public.business_knowledge
for each row execute function public.abos_touch_updated_at();
