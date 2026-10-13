# ABOS-AI-001 — WhatsApp Image and Voice Understanding

**Status:** IMPLEMENTED LOCALLY; VALIDATION AND LIVE MEDIA TEST PENDING

## Goal

Route supported inbound WhatsApp images and voice notes through a secure preprocessing step and the existing shared ABOS AI agent. Do not create a second conversational brain.

## Scope

- Securely retrieve Meta media using the connected business credential kept encrypted in the private connection table.
- Enforce HTTPS/Meta CDN host validation, supported MIME types, redirect bounds, and media size limits.
- Use Cloudflare Qwen vision to create grounded image observations.
- Use Cloudflare Whisper to transcribe voice notes while preserving Nigerian English, Pidgin, slang, and code-switching.
- Persist transcript/observations and provenance in the inbound message metadata/content for conversation continuity.
- Keep the existing auto-reply kill switch, deduplication, retry/handoff, and human-visible failure behavior.

## Non-goals

- No Settings/Meta Embedded Signup change.
- No model chain switch for text replies.
- No deployment, database schema change, or secret change in this task.

## Acceptance criteria

- [ ] Webhook source parses and passes its targeted linter.
- [ ] Image messages reach the existing agent with vision observations, never guessed product facts.
- [ ] Audio messages reach the existing agent with a transcript.
- [ ] Transcript/observation metadata is retained for future conversation context.
- [ ] Unsupported/oversize/failed media gets a truthful resend response and owner task handoff.
- [ ] Live test-number image and voice-note tests pass after reviewed deployment.

## Rollback

Restore the pre-change webhook source from the backup recorded in the task execution output. No production change occurs until a separate reviewed deployment.
