create table public.business_ai_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  language_mode text not null default 'automatic'
    check (language_mode in ('automatic','pidgin','standard_english','professional_english')),
  tone text not null default 'friendly'
    check (tone in ('friendly','professional','casual')),
  response_length text not null default 'balanced'
    check (response_length in ('concise','balanced','detailed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_ai_settings enable row level security;
revoke all on public.business_ai_settings from public, anon;
grant select, insert, update on public.business_ai_settings to authenticated;
grant all on public.business_ai_settings to service_role;

create policy business_ai_settings_select on public.business_ai_settings
for select to authenticated
using (private.is_business_member(business_id));

create policy business_ai_settings_insert on public.business_ai_settings
for insert to authenticated
with check (private.has_business_role(business_id, array['owner','admin']::text[]));

create policy business_ai_settings_update on public.business_ai_settings
for update to authenticated
using (private.has_business_role(business_id, array['owner','admin']::text[]))
with check (private.has_business_role(business_id, array['owner','admin']::text[]));
