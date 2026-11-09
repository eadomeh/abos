# ABOS-OPS-003 — Three-AI Operating Model

**Status:** IN PROGRESS — documentation alignment on `feature/landing-page-redesign`

## Goal

Replace the retired OpenCode / Kimi / Antigravity / Grok Build roster in engineering governance with the approved ChatGPT + Gemini + Grok operating model, without changing application code.

## Authority model

- **ChatGPT** — Chairman / Chief Architect / Release Authority. Requirements, architecture, task packets, repository and infrastructure inspection, final audit, conflict resolution. Supabase and Vercel operations. Not a parallel application-code writer in the same worktree.
- **Grok** — Lead Implementation Engineer and sole canonical code writer on the assigned feature branch. No direct `main` edits, no force-push, no direct production Supabase or Vercel changes.
- **Gemini / Google AI Studio** — Design Lab, research, and independent review of the exact diff. Isolated prototypes. AI Studio sync is write-capable and must not target `main`. No secrets in AI Studio.
- **Human product owner** — product direction, major design decisions, risky operations, cost, and final mobile acceptance.

## Scope

- `AGENTS.md`
- `.abos/decisions/ADR-0001-multi-agent-control-plane.md`
- `.abos/architecture/control-plane.md`
- `.abos/agents/roles.md`
- `.abos/prompts/builder.md`
- `.abos/prompts/reviewer.md`
- `.abos/prompts/scout.md`
- `.abos/prompts/gemini-design-lab.md` (new)
- `.abos/tasks/ABOS-OPS-003-three-ai-operating-model.md` (this packet)
- `.abos/tasks/ABOS-WEB-001-premium-landing-page.md` (companion packet for the in-progress landing branch)

## Non-goals

- No edits under `src/`, `public/`, `package.json`, lockfiles, Supabase migrations, or Vercel settings in this phase.
- No production deploy, domain change, schema change, or merge to `main`.

## Acceptance criteria

- [ ] Governance files name ChatGPT, Grok, and Gemini with the write boundaries above.
- [ ] Retired roster is explicitly not the current team.
- [ ] AI Studio two-way sync is described as write-capable.
- [ ] Phase diff is documentation only.
- [ ] `git diff --check` is clean for the phase.

## Validation

```bash
git diff --check
git diff --stat
```

## Rollback

Revert the documentation commit. No runtime rollback is required.
