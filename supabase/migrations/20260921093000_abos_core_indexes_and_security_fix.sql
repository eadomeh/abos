create index if not exists activity_events_actor_user_idx on public.activity_events(actor_user_id);
create index if not exists automation_runs_automation_idx on public.automation_runs(automation_id);
create index if not exists automations_created_by_idx on public.automations(created_by);
create index if not exists leads_assigned_to_idx on public.leads(assigned_to);
create index if not exists leads_customer_id_idx on public.leads(customer_id);
create index if not exists notes_created_by_idx on public.notes(created_by);
create index if not exists notes_customer_id_idx on public.notes(customer_id);
create index if not exists notes_lead_id_idx on public.notes(lead_id);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_created_by_idx on public.tasks(created_by);
create index if not exists tasks_related_customer_id_idx on public.tasks(related_customer_id);
create index if not exists tasks_related_lead_id_idx on public.tasks(related_lead_id);

drop index if exists public.ux_conversations_business_channel_customer_phone;

create or replace function private.touch_whatsapp_connection()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
