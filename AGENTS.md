# ABOS Engineering Constitution

## Purpose

This file is the repository-wide operating contract for humans and AI engineering agents working on ABOS.

## Canonical source of truth

- Canonical repository: `eadomeh/abos`
- Canonical production branch: `main`
- Local working directory should be named `ABOS_RICH` on the phone.
- Production code lives in the repository root. Do not create parallel copies of the application for individual AI tools.

## Core rules

1. **One repository.** `ABOS_RICH` is the working checkout of the canonical repository.
2. **One writer at a time.** Only one coding agent may actively modify the same worktree at a time.
3. **No direct production edits.** Do not use production as a laboratory.
4. **No direct `main` work.** Feature/fix work starts from `main` on a task branch. Merge only after review and verification.
5. **Task before code.** Every non-trivial change must have an `.abos/tasks/ABOS-*.md` task packet.
6. **Small, coherent changes.** Do not mix unrelated fixes, redesigns, dependency upgrades, or refactors in one task.
7. **Inspect before changing.** Read the existing implementation and relevant data model first.
8. **Respect boundaries.** A task must state what files/systems are in scope and what must not be touched.
9. **No secrets.** Never commit API keys, service-role keys, access tokens, passwords, session files, or production credentials.
10. **Database changes are controlled.** Schema, RLS, functions, triggers, policies, and indexes require an explicit task and post-change verification.
11. **Preserve tenant isolation.** Every business-facing query/mutation must preserve business scoping and the intended authorization model.
12. **Do not weaken security to make code work.** Never remove RLS, authorization, or validation as a shortcut.
13. **AI must not invent business facts.** Business claims must be grounded in retrieved ABOS data, business knowledge, or clearly labeled inference.
14. **No architecture drift.** Agents may propose architectural changes, but implementation follows an approved task/decision.
15. **No blind dependency additions.** Prefer existing dependencies. A new dependency requires a reason and compatibility check.
16. **Verification is part of implementation.** A task is not complete until the relevant checks have run and results are recorded.
17. **Evidence over confidence.** Do not say "fixed" or "done" without test/build/runtime evidence.
18. **Rollback must be possible.** Every risky change must identify a revert/rollback path.

## Standard change lifecycle

```text
TASK
  ↓
INSPECT
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
TYPECHECK / LINT / TEST
  ↓
DIFF REVIEW
  ↓
COMMIT
  ↓
PREVIEW DEPLOY
  ↓
VERIFY
  ↓
PROMOTE / MERGE
```

## Database lifecycle

```text
TASK
  ↓
SCHEMA + ACCESS DESIGN
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

## Agent authority model

### Chairman — ChatGPT

Owns whole-system understanding, task decomposition, architecture decisions, final review direction, and production readiness decisions.

### Lead Builder — OpenCode

Primary implementation agent. May edit application code inside the assigned task scope and run local validation. Must not make unrelated changes.

### Reviewer — Kimi

Independent code reviewer. Default behavior is read-only inspection and defect reporting. It may suggest patches but does not become the second simultaneous writer.

### Scout — Antigravity CLI

Independent research, exploration, debugging, and alternative-solution analysis. Treat its output as a proposal until reviewed.

### UI Lab — Grok Build

UI/UX experimentation only. Never receives production secrets. Good ideas are ported selectively into the canonical repository.

### Expert Consultant — Claude

Optional independent architecture/security/code review. Not required for normal progress.

## Git discipline

- Branch naming: `feat/<area>-<short-name>`, `fix/<area>-<short-name>`, `chore/<area>-<short-name>`, `ops/<id>-<short-name>`.
- Commit messages should explain the change, e.g. `fix: make ai understanding state explicit`.
- Keep commits small enough to review and revert.
- Never force-push shared branches unless explicitly authorized.

## Definition of done

A task is done only when:

- the acceptance criteria are satisfied;
- the relevant automated checks pass;
- the final diff is reviewed;
- security/data-access implications are checked;
- preview/production behavior is verified when applicable;
- evidence is recorded in `.abos/evidence/`;
- the task status is updated.

## Conflict resolution

When agent outputs disagree:

1. inspect the repository and runtime evidence;
2. prefer existing contracts over assumptions;
3. prefer the smallest safe change;
4. record a decision when architecture is affected;
5. escalate unresolved architectural disagreement to the Chairman.
