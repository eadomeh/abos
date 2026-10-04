# ADR-0001 — One Codebase, Many Specialist Agents

**Status:** Accepted

## Context

ABOS is being developed on a phone-only workflow. Using one conversational AI for architecture, implementation, debugging, and deployment creates large messages, repeated context transfer, mobile UI lag, and weak separation of responsibilities.

## Decision

ABOS will use one canonical repository and multiple specialized AI tools with explicit roles.

- ChatGPT owns system-level coordination and engineering governance.
- OpenCode is the primary implementation worker.
- Kimi performs independent review/audit.
- Antigravity provides exploration and alternative analysis.
- Grok Build is isolated to UI experimentation.
- Claude is optional for expert review.

Only one agent may write to a given worktree at a time.

## Consequences

### Positive

- Smaller prompts and less context duplication
- Better separation between implementation and review
- Easier debugging
- Lower risk of uncontrolled changes
- Vendor independence
- Better fit for phone-based development

### Negative

- More orchestration overhead
- Requires disciplined task packets
- Agents can disagree and require explicit resolution

## Rejected alternative

Maintaining independent full copies of ABOS for each AI tool was rejected because it creates version drift, merge conflicts, and uncertainty about the canonical state.
