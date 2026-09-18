# ABOS Architecture

## Product boundary
ABOS is a multi-tenant AI Business Operating System. Businesses own their data through `business_id`; users access business data through `business_memberships` and database RLS.

## Source of truth
GitHub is the canonical source. Builder platforms may accelerate UI work, but they do not own the code, schema, secrets, or deployment process.

## Runtime
- Web app: React + TypeScript + Vite
- Data/auth/realtime: Supabase PostgreSQL + Auth + Realtime
- Server-side integrations: Supabase Edge Functions
- First customer channel: WhatsApp Business Cloud API
- ML workloads: Python/FastAPI when long-running or model-specific workloads justify a separate service

## Data flow
Customer -> channel -> webhook -> Edge Function -> PostgreSQL -> Realtime -> ABOS inbox -> agent/action -> channel

## Tenant isolation
Every business-owned record carries a `business_id`. Client-visible access is protected by RLS. Internal authorization helpers live in the non-exposed `private` schema.

## Secrets
Browser-safe configuration contains only the Supabase project URL and publishable key. Provider tokens, Meta App Secret, service-role credentials, and AI provider keys stay server-side.

## Channel abstraction
Conversations and messages include a `channel` field so WhatsApp is the first adapter rather than a permanent data-model constraint. Instagram, Messenger, email, and web are planned adapters.
