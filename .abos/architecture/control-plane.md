# ABOS Engineering Control Plane

```text
                     HUMAN PRODUCT OWNER
              direction, risk, cost, mobile acceptance
                              │
                           CHATGPT
          Chairman / Chief Architect / Release Authority
          tasks, architecture, audit, Supabase, Vercel
                              │
              ┌───────────────┴───────────────┐
              │                               │
            GROK                            GEMINI
   sole canonical code writer        Design Lab / Researcher
   feature branch only               Independent diff reviewer
              │                       isolated prototypes
              │                               │
              └───────────────┬───────────────┘
                              │
                     GitHub feature branch
                              │
                    ChatGPT promotes approved SHA
                              │
                           main
                              │
               ┌──────────────┴──────────────┐
               │                             │
           Supabase                        Vercel
        DB / Auth / Functions           Deployments
               │
          Model / tool layer

   Retired, not active: OpenCode, Kimi, Antigravity, Grok Build
```

## Golden rule

Agents collaborate through **tasks, branches, commits, exact diffs, reviews, and evidence**, not by maintaining competing copies of ABOS and not by sharing one worktree.

## Write boundary

| Surface | Who may change it |
| --- | --- |
| Canonical application code on the assigned feature branch | Grok only |
| `main` | Nobody during implementation. ChatGPT promotes an approved SHA later. |
| Supabase production schema, RLS, functions, policies | ChatGPT, only after an explicit approved task |
| Vercel production alias and custom domain | ChatGPT, only for an approved SHA. Grok does not retarget production. |
| Design prototypes | Gemini, in an isolated copy. Sync back only to an explicitly approved non-production branch. |
| Secrets | Nobody puts them in prompts, AI Studio, Git, or preview client code. |

## Change flow

```text
Human sets direction
       ↓
ChatGPT writes the task packet from a verified main SHA
       ↓
Grok implements on the assigned feature branch
       ↓
Grok runs checks, reviews the diff, commits, pushes
       ↓
Gemini reviews that exact commit/diff (and may prototype visuals aside)
       ↓
ChatGPT audits findings and the preview
       ↓
Human accepts mobile/product behavior where required
       ↓
ChatGPT promotes the approved SHA
       ↓
Evidence recorded
```

Vercel preview is the verification surface for feature work. `READY` means the build compiled. It does not prove visual correctness or mobile acceptance.

## AI Studio caution

Google AI Studio Build can sync both ways with GitHub. That is a write path. Do not treat an import as read-only. If the target branch is unclear, do not sync.
