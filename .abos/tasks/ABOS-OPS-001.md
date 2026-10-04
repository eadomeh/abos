# ABOS-OPS-001 — Multi-Agent Engineering Control Plane

**Status:** IMPLEMENTED LOCALLY / PENDING REPOSITORY BRANCH PUSH

## Goal

Bootstrap a lightweight, vendor-neutral engineering control plane around the existing ABOS production repository so multiple AI tools can collaborate without creating conflicting versions of the project.

## Current state / evidence

- Canonical repository: `eadomeh/abos`
- Production branch: `main`
- Current production commit at task start: `08623f7201b87d47058d66921be31d1449b5bfc7`
- Vercel production deployment was READY on that commit.
- Supabase project `ABOS-RICH` was ACTIVE_HEALTHY.
- Existing AI, WhatsApp, inventory, orders, customers, leads, conversation, and evaluation foundations remain in place.

## Scope

- Repository-wide AI agent constitution
- `.abos/` control-plane directories and task protocol
- `.opencode/` portable integration guidance
- GitHub pull-request template
- Local validation helper
- Architecture and role documents

## Non-goals

- No application feature changes
- No database schema changes
- No production credential changes
- No new runtime dependencies
- No replacement of the existing AI agent
- No vendor lock-in to one coding agent

## Agent model

```text
ChatGPT = Chairman / architecture / review direction
OpenCode = primary builder
Kimi = independent reviewer
Antigravity = scout / alternative analysis
Grok Build = UI laboratory
Claude = optional expert consultant
GitHub = source of truth
Supabase = data/auth/backend platform
Vercel = deployment platform
Cloudflare = model inference layer
```

## Acceptance criteria

- [x] `AGENTS.md` defines the repository engineering constitution.
- [x] `.abos/` contains tasks, decisions, evidence, architecture, checklists, prompts, and agent-role areas.
- [x] `.opencode/` contains portable builder/reviewer integration guidance without hard-coding secrets.
- [x] GitHub PR template exists.
- [x] A dependency-free validation helper exists.
- [x] No application source or database schema is modified by OPS-001.
- [ ] Changes are committed on an isolated Git branch.
- [ ] Branch is reviewed before merge.

## Validation

Run from the repository root:

```bash
bash scripts/abos-ops-001-check.sh
npm run typecheck
npm run lint
npm run build
```

## Rollback

Remove the OPS-001 files or revert the OPS-001 commit. No runtime data migration is associated with this task.

## Next task

`ABOS-OPS-002` will establish the first real engineering change loop: branch → task packet → implementation agent → independent review → checks → preview deployment → evidence.
