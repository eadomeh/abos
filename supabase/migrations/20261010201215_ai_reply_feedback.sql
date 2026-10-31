-- Owner feedback on AI replies (thumbs up/down + corrected reply). Feeds the learning loop:
-- good and corrected replies become examples the agent can reuse; bad ones become test cases.
create table public.ai_reply_feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  run_id uuid,
  rating smallint not null check (rating in (-1, 1)),
  customer_message text,
  ai_reply text not null,
  edited_reply text,
  note text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_reply_feedback_one_per_user unique (message_id, created_by)
);

create index ai_reply_feedback_business_idx
  on public.ai_reply_feedback (business_id, rating, created_at desc);
create index ai_reply_feedback_conversation_idx
  on public.ai_reply_feedback (conversation_id);

alter table public.ai_reply_feedback enable row level security;

create policy select_ai_reply_feedback on public.ai_reply_feedback
  for select to authenticated
  using (private.is_business_member(business_id));

create policy insert_ai_reply_feedback on public.ai_reply_feedback
  for insert to authenticated
  with check (private.is_business_member(business_id) and created_by = auth.uid());

create policy update_ai_reply_feedback on public.ai_reply_feedback
  for update to authenticated
  using (private.is_business_member(business_id) and created_by = auth.uid())
  with check (private.is_business_member(business_id) and created_by = auth.uid());

create policy delete_ai_reply_feedback on public.ai_reply_feedback
  for delete to authenticated
  using (private.is_business_member(business_id) and created_by = auth.uid());

create trigger ai_reply_feedback_touch_updated_at
  before update on public.ai_reply_feedback
  for each row execute function public.update_updated_at_column();

revoke all on public.ai_reply_feedback from anon;

-- One call for the UI. SECURITY INVOKER: row level security still decides what the caller may see
-- and write; the business, the customer message and the AI reply are read server-side, never trusted
-- from the browser.
create or replace function public.submit_reply_feedback(
  p_message_id uuid,
  p_rating smallint,
  p_edited_reply text default null,
  p_note text default null
)
returns public.ai_reply_feedback
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_msg public.messages%rowtype;
  v_prev text;
  v_run_id uuid;
  v_row public.ai_reply_feedback;
begin
  if p_rating not in (-1, 1) then
    raise exception 'rating must be -1 or 1';
  end if;

  select * into v_msg from public.messages where id = p_message_id;
  if not found then
    raise exception 'message not found';
  end if;

  if v_msg.direction <> 'outgoing' or coalesce(v_msg.metadata ->> 'source', '') <> 'ai_agent' then
    raise exception 'feedback can only be given on AI replies';
  end if;

  select content into v_prev
  from public.messages
  where conversation_id = v_msg.conversation_id
    and direction = 'incoming'
    and created_at < v_msg.created_at
  order by created_at desc
  limit 1;

  if (v_msg.metadata ->> 'run_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_run_id := (v_msg.metadata ->> 'run_id')::uuid;
  end if;

  insert into public.ai_reply_feedback
    (business_id, conversation_id, message_id, run_id, rating, customer_message, ai_reply, edited_reply, note, created_by)
  values
    (v_msg.business_id, v_msg.conversation_id, v_msg.id, v_run_id, p_rating, v_prev, v_msg.content,
     nullif(btrim(p_edited_reply), ''), nullif(btrim(p_note), ''), auth.uid())
  on conflict (message_id, created_by) do update
    set rating = excluded.rating,
        edited_reply = excluded.edited_reply,
        note = excluded.note
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.submit_reply_feedback(uuid, smallint, text, text) from public, anon;
grant execute on function public.submit_reply_feedback(uuid, smallint, text, text) to authenticated;