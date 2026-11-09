# ADR-0001 — One Codebase, Three-AI Operating Model

**Status:** Accepted — superseded operating roster (2026-11-09)

## Context

ABOS is developed with a small set of AI tools plus a human product owner. Using one conversational AI for architecture, implementation, design exploration, review, and deployment creates large messages, weak separation of responsibilities, and unsafe writes to production.

An earlier roster named OpenCode as builder, Kimi as reviewer, Antigravity as scout, and Grok Build as an isolated UI lab. That roster is retired. The approved team is ChatGPT, Grok, and Gemini, with the human as product owner.

## Decision

ABOS uses one canonical repository (`eadomeh/abos`) and three specialized AI roles with explicit write boundaries. `main` is production.

- **ChatGPT** is Chairman, Chief Architect, and Release Authority. It owns requirements, architecture, task packets, whole-repository and infrastructure inspection, final engineering audit, and conflict resolution. It owns Supabase and Vercel operations, including inspection of production schema and migration history, explicitly approved database changes, preview review, and promotion of an approved commit. It does not write application code in the same task or worktree as Grok.
- **Grok** is Lead Implementation Engineer and the sole canonical code writer. It implements the assigned task on a feature branch, runs checks, reviews its own diff, and commits and pushes that branch. It does not edit `main`, force-push, or change Supabase or Vercel production directly.
- **Gemini / Google AI Studio** is Design Lab, Researcher, and Independent Reviewer. It explores visual directions in isolated prototypes, researches alternatives, and reviews Grok's exact diff. It does not write the shared canonical worktree or push to `main`. AI Studio GitHub sync is write-capable; use it only on an explicitly approved non-production feature branch. If branch targeting is ambiguous, do not sync.
- **Human product owner** approves product direction, major design decisions, risky operations, additional cost, and final mobile acceptance.

Only one agent may write a given worktree at a time. That writer is Grok for canonical application code.

Gemini must review the exact commit and diff. Approval based only on Grok's summary is invalid.

No production secrets, service-role keys, customer data, or private operational credentials go into prompts or AI Studio.

## Consequences

### Positive

- Clear sole writer for canonical code
- Architecture and release authority separated from implementation
- Design experiments stay isolated until explicitly accepted
- Review is tied to the real diff
- Infrastructure changes stay with the release authority
- One canonical history

### Negative

- Orchestration overhead between three tools and the human
- Requires disciplined task packets and exact-diff review
- AI Studio sync can write if misconfigured; it must be treated as dangerous

## Rejected alternatives

- **Independent full copies of ABOS per AI tool.** Rejected. It creates version drift and uncertainty about the canonical state.
- **OpenCode + Kimi + Antigravity + Grok Build roster.** Retired. It is not the current operating team.
- **ChatGPT and Grok both editing the same worktree.** Rejected. Two writers on one tree produce conflicting edits and unauditable diffs.
- **Gemini pushing design prototypes straight to `main`.** Rejected. Prototypes stay isolated until a reviewed feature-branch commit is accepted.
