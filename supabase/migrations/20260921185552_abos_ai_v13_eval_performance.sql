create index if not exists idx_ai_eval_batches_created_by
  on public.ai_agent_evaluation_batches (created_by);

create index if not exists idx_ai_agent_runs_user_id
  on public.ai_agent_runs (user_id);

create index if not exists idx_business_knowledge_created_by
  on public.business_knowledge (created_by);

create index if not exists idx_conversation_ai_state_last_message
  on public.conversation_ai_state (last_analyzed_message_id);

drop policy if exists "ai_agent_evaluations_select" on public.ai_agent_evaluations;
create policy "ai_agent_evaluations_select"
on public.ai_agent_evaluations
for select to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.owner_id = (select auth.uid())
  )
);

drop policy if exists "ai_eval_batches_owner_select" on public.ai_agent_evaluation_batches;
create policy "ai_eval_batches_owner_select"
on public.ai_agent_evaluation_batches
for select to authenticated
using (created_by = (select auth.uid()));

drop policy if exists "ai_eval_runs_owner_select" on public.ai_agent_evaluation_runs;
create policy "ai_eval_runs_owner_select"
on public.ai_agent_evaluation_runs
for select to authenticated
using (
  exists (
    select 1
    from public.ai_agent_evaluation_batches b
    where b.id = ai_agent_evaluation_runs.batch_id
      and b.created_by = (select auth.uid())
  )
);