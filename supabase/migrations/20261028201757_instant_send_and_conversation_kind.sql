-- A-4 / A-1 groundwork (additive).
-- 1) messages: client_id for idempotent sends, wider status set, forward-only status guard.
-- 2) conversations: kind column so AI Agent Workspace sessions stay out of the customer inbox.

alter table public.messages add column if not exists client_id uuid;

create unique index if not exists messages_conversation_client_id_uidx
  on public.messages (conversation_id, client_id)
  where client_id is not null;

alter table public.messages drop constraint if exists messages_status_check;
alter table public.messages add constraint messages_status_check
  check (status = any (array['queued','sending','sent','delivered','read','failed']::text[]));

create or replace function public.messages_guard_status()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  old_rank int;
  new_rank int;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  -- A failed message may be retried (failed -> sending) or corrected by Meta.
  if old.status = 'failed' then
    return new;
  end if;

  old_rank := case old.status when 'queued' then 0 when 'sending' then 0 when 'sent' then 1 when 'delivered' then 2 when 'read' then 3 else 0 end;

  if new.status = 'failed' then
    -- Once delivered or read, a late failure receipt must not overwrite the status.
    if old_rank >= 2 then
      new.status := old.status;
      new.error_code := old.error_code;
      new.error_message := old.error_message;
    end if;
    return new;
  end if;

  new_rank := case new.status when 'queued' then 0 when 'sending' then 0 when 'sent' then 1 when 'delivered' then 2 when 'read' then 3 else 0 end;

  -- Receipts can arrive out of order: never move a message backwards.
  if new_rank < old_rank then
    new.status := old.status;
  end if;
  return new;
end;
$$;

revoke all on function public.messages_guard_status() from public, anon, authenticated;

drop trigger if exists messages_guard_status_trg on public.messages;
create trigger messages_guard_status_trg
  before update of status on public.messages
  for each row execute function public.messages_guard_status();

alter table public.conversations add column if not exists kind text not null default 'customer';
alter table public.conversations drop constraint if exists conversations_kind_check;
alter table public.conversations add constraint conversations_kind_check
  check (kind = any (array['customer','ai_workspace']::text[]));

update public.conversations
   set kind = 'ai_workspace'
 where channel = 'web' and customer_name = 'AI Agent Workspace' and kind <> 'ai_workspace';

create or replace function public.conversations_set_kind()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.channel = 'web' and new.customer_name = 'AI Agent Workspace' then
    new.kind := 'ai_workspace';
  end if;
  return new;
end;
$$;

revoke all on function public.conversations_set_kind() from public, anon, authenticated;

drop trigger if exists conversations_set_kind_trg on public.conversations;
create trigger conversations_set_kind_trg
  before insert on public.conversations
  for each row execute function public.conversations_set_kind();
