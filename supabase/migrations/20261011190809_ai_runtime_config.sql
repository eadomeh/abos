-- Runtime switches for the AI agent (which model answers, and the fallback order).
-- Read only by Edge Functions through the service role: RLS is on with no policies, so the
-- browser can neither read nor change it. Lets us switch models instantly without a redeploy.
create table public.ai_runtime_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.ai_runtime_config enable row level security;
revoke all on public.ai_runtime_config from anon, authenticated;

insert into public.ai_runtime_config (key, value) values
  ('primary_model', '@cf/zai-org/glm-4.7-flash'),
  ('fallback_models', '@cf/google/gemma-4-26b-a4b-it,@cf/meta/llama-3.3-70b-instruct-fp8-fast,@cf/openai/gpt-oss-120b,@cf/nvidia/nemotron-3-120b-a12b');