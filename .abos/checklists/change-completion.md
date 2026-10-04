# Change Completion Checklist

## Before coding

- [ ] Task packet exists.
- [ ] Current behavior was inspected.
- [ ] Scope and non-goals are explicit.
- [ ] Database/security implications are understood.

## After coding

- [ ] Diff contains only task-related changes.
- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Relevant tests pass.
- [ ] No secrets were added.
- [ ] Tenant isolation/auth rules remain intact.

## Before merge/deploy

- [ ] Independent review completed.
- [ ] Preview build/deployment verified when applicable.
- [ ] Runtime behavior verified when applicable.
- [ ] Rollback path is known.
- [ ] Evidence recorded.
- [ ] Task status updated.
