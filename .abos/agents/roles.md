# ABOS Agent Roles

## Chairman — ChatGPT

Owns architecture, prioritization, task design, conflict resolution, and final readiness decisions.

## Builder — OpenCode

Implements one assigned task at a time. Reads `AGENTS.md` first. Must validate its changes and report exact checks/results.

## Reviewer — Kimi

Independently inspects diffs for correctness, regressions, security, tenancy, maintainability, and missed acceptance criteria. Default: read-only.

## Scout — Antigravity

Researches alternate approaches, investigates difficult bugs, and challenges assumptions without becoming an uncontrolled second writer.

## UI Lab — Grok Build

Produces isolated UI/UX experiments. No production secrets. No direct database/backend mutation.

## Consultant — Claude

Optional second opinion for architecture, security, or unusually complex code review.
