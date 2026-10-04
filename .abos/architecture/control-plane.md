# ABOS Engineering Control Plane

```text
                        CHATGPT
                 Chairman / Control Plane
                           │
            ┌──────────────┼──────────────┐
            │              │              │
         OpenCode        Kimi       Antigravity
          Builder       Reviewer       Scout
            │              │              │
            └──────────────┼──────────────┘
                           │
                    GitHub / main
                           │
             ┌─────────────┴─────────────┐
             │                           │
         Supabase                      Vercel
      DB/Auth/Functions             Deployments
             │
         Cloudflare AI
          Model layer

   Grok Build → isolated UI laboratory
   Claude     → optional expert consultant
```

## Golden rule

Agents collaborate through **tasks, branches, commits, reviews, and evidence**, not by maintaining competing copies of ABOS.

## Change flow

```text
Chairman creates task
       ↓
Builder implements
       ↓
Builder validates
       ↓
Reviewer audits
       ↓
Chairman resolves findings
       ↓
Preview deploy
       ↓
Runtime/UI verification
       ↓
Merge/promote
       ↓
Evidence recorded
```
