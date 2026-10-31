# ABOS production source parity checkpoint — A-0

**Reviewed production baseline:** `main` at `f574b35352cfdc42b98d23010cff9426d4d35b36`
**Supabase project:** `iqbhzoanssmskohhmpgj`
**Recovery scope:** repository source files only.

## Database migration history

The live `supabase_migrations.schema_migrations` ledger contained 45 applied migration records.
Each exported file uses the exact database `version` prefix, `name`, and `statements[1]` SQL.
The migration SQL in this recovery was checked against the source ledger using PostgreSQL MD5
checksums for every one of the 45 statements. The machine-readable manifest records each digest.

No migration was applied, rolled back, or edited in the live database during this recovery.

## Deployed Edge Functions

| Function | Live version | `verify_jwt` | Recovery action |
|---|---:|---:|---|
| `whatsapp-send` | 8 | true | Restored deployed `index.ts` source |
| `abos-ai-agent` | 31 | false | Restored deployed `index.ts` and `deno.json` |
| `whatsapp-webhook` | 11 | false | Source confirmed identical to `main`; unchanged |
| `business-team-invite` | 1 | true | Source confirmed identical to `main`; JWT config entry added |
| `abos-ai-eval` | 9 | false | Main differs only by whitespace after a seed insert |
| `whatsapp-connection` | 9 | true | Source confirmed identical to `main`; unchanged |
| `whatsapp-connect-once` | 4 | false | Source confirmed identical to `main`; unchanged |
| `abos-ai-probe` | 4 | true | Source confirmed identical to `main`; unchanged |

## Verification boundary

- Both restored Edge Function files were compared against the retrieved live sources using
  UTF-16 FNV-1a 64-bit fingerprints and exact character counts.
- `supabase/config.toml` includes all eight deployed functions with their live `verify_jwt` settings.
- `APPLY_A0_RECOVERY.sh` verifies the baseline SHA, exact migration SQL checksums, and clean
  tracked working tree; it stages only Supabase source paths.
- The script runs `npm run typecheck`, `npm run lint`, `npm run build`, and Git diff checks before
  creating/pushing the recovery branch.

## Explicitly not performed

No SQL statements or migrations were run against Supabase. No Edge Functions were deployed.
No Vercel production deployment was triggered. No business/customer/payment data was changed.

**Status:** Source recovery bundle prepared and locally checksum-verified. Repository branch,
commit, and user-side typecheck/lint/build results remain pending execution of the included script.
