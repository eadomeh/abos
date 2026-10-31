alter table public.ai_agent_evaluation_batches
  add column if not exists created_by uuid references auth.users(id);

drop policy if exists "ai_eval_batches_owner_select" on public.ai_agent_evaluation_batches;
create policy "ai_eval_batches_owner_select"
on public.ai_agent_evaluation_batches
for select to authenticated
using (created_by = auth.uid());

drop policy if exists "ai_eval_runs_owner_select" on public.ai_agent_evaluation_runs;
drop policy if exists "ai_agent_evaluation_runs_select" on public.ai_agent_evaluation_runs;
create policy "ai_eval_runs_owner_select"
on public.ai_agent_evaluation_runs
for select to authenticated
using (
  exists (
    select 1
    from public.ai_agent_evaluation_batches b
    where b.id = ai_agent_evaluation_runs.batch_id
      and b.created_by = auth.uid()
  )
);