# ABOS Engineering Constitution

## Purpose

This file is the repository-wide operating contract for the human product owner and the approved AI engineering team working on ABOS.

## Canonical source of truth

- Canonical repository: `eadomeh/abos`
- Canonical production branch: `main`
- Production domain: `abos-tau.vercel.app` tracks the accepted `main` deployment. Do not retarget it from a feature branch.
- Local working directory should be named `ABOS_RICH` on the phone.
- Production code lives in the repository root. Do not create parallel copies of the application for individual AI tools.

## Approved operating team

| Role | Who | Writes canonical app code? |
| --- | --- | --- |
| Chairman / Chief Architect / Release Authority | ChatGPT | No. Audits, task packets, infrastructure. |
| Lead Implementation Engineer | Grok | Yes. Sole writer of the assigned feature branch. |
| Design Lab / Researcher / Independent Reviewer | Gemini / Google AI Studio | No shared worktree. Isolated prototypes only. |
| Product owner | Human user | Approves direction, risk, cost, and mobile acceptance. |

OpenCode, Kimi, Antigravity, and Grok Build are not the current operating team. Do not assign them work or describe them as active roles.

## Authority

### ChatGPT — Chairman / Chief Architect / Release Authority

- Owns requirements, system architecture, task packets, whole-repository and infrastructure inspection, final engineering audit, and conflict resolution.
- Owns Supabase and Vercel operations: inspect production schema and migration history, authorize and apply explicitly approved database changes, review preview deployments, promote the approved commit, and verify production.
- Does not become a parallel application-code writer in the same task or worktree.

### Grok — Lead Implementation Engineer / Sole canonical code writer

- Inspects the repository, implements the assigned task, runs checks, reviews its own diff, commits, and pushes to the assigned feature branch.
- Must read `AGENTS.md` and the task packet first.
- Must never work directly on `main`, force-push, introduce unrelated changes, or modify Supabase or Vercel production directly.
- One active writer per branch and worktree.

### Gemini / Google AI Studio — Design Lab / Researcher / Independent Reviewer

- Explores visual directions, creates isolated prototypes, researches alternatives, and performs read-only adversarial review of Grok's actual diff.
- Must not write to the canonical repository's shared worktree or push directly to `main`.
- No production secrets, service-role keys, customer data, or private operational credentials in AI Studio.
- AI Studio Build supports two-way GitHub sync. Treat this as a write-capable integration, not a harmless read-only import. Use a standalone design prototype or isolated copy for experiments. Only sync changes back when a clearly non-production feature branch is explicitly selected and the user has approved it. If branch targeting is ambiguous or unavailable, do not sync or push to the canonical repository.
- Gemini reviews the exact commit and diff. It must not approve based on a summary from Grok alone.

### Human product owner

- Approves product direction, major design decisions, risky operations, and additional cost.
- Performs final Android and mobile acceptance testing.

## Core rules

1. **One repository.** `eadomeh/abos` is canonical. `main` is production.
2. **One writer.** Only Grok writes canonical application code. One active writer per branch and worktree.
3. **Verified baseline.** All work starts from a verified `main` SHA on a task-specific feature branch. An in-progress branch is retained only when the task packet says so.
4. **No direct `main` edits.** No force-pushes. No production experiments.
5. **Task before code.** Every non-trivial change must have an `.abos/tasks/ABOS-*.md` task packet.
6. **Small, coherent changes.** One coherent commit per phase where possible. Do not mix unrelated fixes, redesigns, dependency upgrades, or refactors.
7. **Inspect before changing.** Read the existing implementation and relevant data model first.
8. **Respect boundaries.** A task must state what files and systems are in scope and what must not be touched.
9. **No secrets.** Never put secrets in prompts, AI Studio, GitHub, preview client code, or commits. This includes API keys, service-role keys, access tokens, passwords, and session files.
10. **Database changes are controlled.** No unapproved Supabase schema, RLS, function, trigger, policy, or index changes. Approved changes require an explicit task and post-change verification.
11. **Preserve tenant isolation.** Every business-facing query and mutation must preserve business scoping and the intended authorization model.
12. **Do not weaken security to make code work.** Never remove RLS, authorization, or validation as a shortcut.
13. **AI must not invent business facts.** Business claims must be grounded in retrieved ABOS data, business knowledge, or clearly labeled inference.
14. **No architecture drift.** Agents may propose architectural changes, but implementation follows an approved task or decision.
15. **No unapproved dependencies.** Prefer existing dependencies. A new dependency requires a reason, a compatibility check, and task approval.
16. **Preserve behavior outside scope.** Do not change application identity or behavior that the task does not name.
17. **Verification is part of implementation.** A task is not complete until the relevant checks have run and results are recorded. `READY` build status is not proof of visual correctness or mobile acceptance.
18. **Evidence over confidence.** Do not say "fixed" or "done" without test, build, or runtime evidence.
19. **Production promotion is explicit.** Production deployment requires the exact approved GitHub SHA, a successful build, a reviewed diff, a verified deployment ID and alias, and user acceptance where applicable.
20. **Rollback must be possible.** Every risky change must identify a revert or rollback path.

## Standard change lifecycle

```text
TASK
  ↓
INSPECT (verified main SHA, feature branch)
  ↓
PLAN
  ↓
GROK IMPLEMENTS (sole writer)
  ↓
TYPECHECK / LINT / BUILD
  ↓
GROK DIFF REVIEW + COMMIT + PUSH
  ↓
GEMINI REVIEWS THE EXACT DIFF
  ↓
CHATGPT AUDITS
  ↓
VERCEL PREVIEW
  ↓
USER ACCEPTANCE WHERE REQUIRED
  ↓
CHATGPT PROMOTES THE APPROVED SHA
  ↓
EVIDENCE RECORDED
```

## Database lifecycle

```text
TASK
  ↓
SCHEMA + ACCESS DESIGN (ChatGPT)
  ↓
EXPLICIT USER APPROVAL
  ↓
IMPLEMENT MIGRATION / SQL
  ↓
VERIFY DATA + RLS + FUNCTIONS
  ↓
RUN SECURITY/PERFORMANCE ADVISORS
  ↓
APPLICATION TESTS
  ↓
DEPLOY
```

ChatGPT authorizes and applies approved database changes. Grok does not modify production Supabase directly.

## Git discipline

- Branch naming: `feat/<area>-<short-name>`, `fix/<area>-<short-name>`, `chore/<area>-<short-name>`, `ops/<id>-<short-name>`, or an existing task branch named in the packet.
- Commit messages should explain the change, for example `fix(landing): restore full ABOS stylesheet`.
- Keep commits small enough to review and revert.
- Never force-push shared branches unless explicitly authorized.
- Do not push to `main` from an implementation task.

## Definition of done

A task is done only when:

- the acceptance criteria are satisfied;
- the relevant automated checks pass;
- the final diff is reviewed against the exact commit, not a summary;
- security and data-access implications are checked;
- preview behavior is verified when applicable;
- production remains untouched until an explicit promotion of the approved SHA;
- evidence is recorded in `.abos/evidence/` when the task requires it;
- the task status is updated.

## Conflict resolution

When outputs disagree:

1. inspect the repository and runtime evidence;
2. Gemini reviews the exact diff, not a narrative of it;
3. prefer existing contracts over assumptions;
4. prefer the smallest safe change;
5. record a decision when architecture is affected;
6. ChatGPT resolves unresolved architectural disagreement;
7. the human product owner decides product direction, risk, and cost.
