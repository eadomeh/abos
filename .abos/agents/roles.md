# ABOS Agent Roles

The active operating model is ChatGPT + Grok + Gemini, plus the human product owner. OpenCode, Kimi, Antigravity, and Grok Build are retired names. Do not assign them tasks.

## Chairman / Chief Architect / Release Authority — ChatGPT

Owns requirements, system architecture, task packets, whole-repository and infrastructure inspection, final engineering audit, and conflict resolution.

Owns Supabase and Vercel operations: inspect production schema and migration history, authorize and apply explicitly approved database changes, review preview deployments, promote the approved commit, and verify production.

Does not write application code in the same task or worktree as the implementation engineer.

## Lead Implementation Engineer — Grok

Sole canonical code writer. Inspects the repository, implements the assigned task, runs checks, reviews its own diff, and commits and pushes the assigned feature branch.

Must read `AGENTS.md` and the task packet first. Must not edit `main`, force-push, expand scope, or modify Supabase or Vercel production directly. One active writer per branch and worktree.

## Design Lab / Researcher / Independent Reviewer — Gemini / Google AI Studio

Explores visual directions, creates isolated prototypes, researches alternatives, and performs read-only adversarial review of Grok's actual commit and diff. Must not approve from Grok's summary alone.

Must not write the canonical shared worktree or push to `main`. No production secrets, service-role keys, customer data, or private credentials in AI Studio.

AI Studio GitHub sync is write-capable. Use a standalone prototype or isolated copy. Sync back only when a non-production feature branch is explicitly selected and the user has approved it. If branch targeting is ambiguous, do not sync.

## Human product owner

Approves product direction, major design decisions, risky operations, and additional cost. Performs final Android and mobile acceptance testing.

## Prompt map

| Role | Prompt |
| --- | --- |
| Grok, implementation | `.abos/prompts/builder.md` |
| Gemini, exact-diff review | `.abos/prompts/reviewer.md` |
| Gemini, research | `.abos/prompts/scout.md` |
| Gemini, visual prototypes | `.abos/prompts/gemini-design-lab.md` |
