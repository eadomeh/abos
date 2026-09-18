# ABOS Wiring 0.3

ABOS frontend is wired to the dedicated `ABOS-RICH` Supabase project.

- Supabase URL: `https://iqbhzoanssmskohhmpgj.supabase.co`
- Frontend key: publishable key only
- Local runtime config: `.env.local` (ignored by Git)
- Local Supabase CLI target: `iqbhzoanssmskohhmpgj`
- WhatsApp send calls: `supabase.functions.invoke("whatsapp-send")`
- Workspace UI never uses the auth email as its visible business identity.

Server-only provider secrets must remain in Supabase Edge Function secrets and must never be placed in `.env.local`.
