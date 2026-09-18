# ABOS — AI Business Operating System

ABOS is the foundation of Project RICH: a multi-tenant business platform that brings customer conversations, CRM, sales, automation, analytics, and AI revenue intelligence into one workspace.

## Source of truth

**Git is the source of truth.** Bolt, Lovable, Base44, Replit, and similar builder tools are optional accelerators. They never own the production source, database schema, secrets, or deployment state.

## Stack

- React + TypeScript + Vite
- Supabase Auth + PostgreSQL + Realtime + Edge Functions
- WhatsApp Business Cloud API (first channel)
- Python/FastAPI later for longer-running ML workloads

## ABOS-owned infrastructure

- Supabase project: `ABOS-RICH`
- Project ref: `iqbhzoanssmskohhmpgj`
- Region: `eu-west-1`
- Browser API uses the Supabase publishable key only

## Local development

1. Use the included `.env.local` for the ABOS-RICH development project (it is ignored by Git). For a fresh machine, copy `.env.example` to `.env.local`.
2. Add the Supabase publishable key for the ABOS-RICH project.
3. Install dependencies with `npm ci`.
4. Run `npm run dev`.
5. Before committing, run `npm run typecheck`, `npm run lint`, and `npm run build`.

## Infrastructure rule

No production secret belongs in the browser. Service-role keys, WhatsApp credentials, Meta app secrets, and AI provider keys belong in server-side/Edge Function secrets.

## Current milestone

**Takeover 0.3:** wire the frontend to the dedicated ABOS-RICH project, bind local Supabase CLI configuration, include the browser-safe publishable key locally, and route WhatsApp sends through the Supabase function client.

## WhatsApp webhook secret contract

The webhook function expects server-side secrets:

- `META_APP_SECRET` — Meta App Secret used to validate `X-Hub-Signature-256`.
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` — webhook verification token configured in Meta.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase runtime secret; never expose it to the browser.

Meta's webhook documentation requires HTTPS endpoint verification and recommends validating the `X-Hub-Signature-256` HMAC signature for event notifications.
