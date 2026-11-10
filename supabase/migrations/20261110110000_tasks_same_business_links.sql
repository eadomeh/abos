-- Enforce that task customer/lead links share the task business_id.
-- Does not change RLS. Does not rewrite existing rows.
-- Aborts if any cross-business link already exists.

do $$
begin
  if exists (
    select 1
    from public.tasks t
    join public.customers c on c.id = t.related_customer_id
    where t.related_customer_id is not null
      and c.business_id is distinct from t.business_id
  ) or exists (
    select 1
    from public.tasks t
    join public.leads l on l.id = t.related_lead_id
    where t.related_lead_id is not null
      and l.business_id is distinct from t.business_id
  ) then
    raise exception 'ABOS preflight aborted: a task link points at another business';
  end if;
end $$;

create or replace function public.tasks_enforce_same_business_links()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.related_customer_id is not null
     and not exists (
       select 1
       from public.customers c
       where c.id = new.related_customer_id
         and c.business_id = new.business_id
     ) then
    raise exception 'related_customer_id must belong to the task business';
  end if;

  if new.related_lead_id is not null
     and not exists (
       select 1
       from public.leads l
       where l.id = new.related_lead_id
         and l.business_id = new.business_id
     ) then
    raise exception 'related_lead_id must belong to the task business';
  end if;

  return new;
end;
$function$;

revoke all on function public.tasks_enforce_same_business_links() from public;
revoke all on function public.tasks_enforce_same_business_links() from anon;
revoke all on function public.tasks_enforce_same_business_links() from authenticated;

drop trigger if exists tasks_same_business_links on public.tasks;
create trigger tasks_same_business_links
before insert or update of related_customer_id, related_lead_id, business_id
on public.tasks
for each row
execute function public.tasks_enforce_same_business_links();
