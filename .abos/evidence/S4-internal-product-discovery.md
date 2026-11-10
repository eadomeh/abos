# S4 — Internal product discovery

**Status:** DISCOVERY ONLY. No application code was changed.
**Branch:** `feature/slice-4-internal-product-discovery`
**Baseline:** `main` `1139d93dc9cf374166659db1e920047461f2de0e`
**Evidence date:** 2026-11-10
**Rule:** Files in this tree prove what the source contains. They do not prove live Supabase schema, applied migrations, RLS in production, or role behavior against a real session.

## 1. Module inventory

Navigation is a client page switch in [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx) and [src/components/layout/AppShell.tsx](src/components/layout/AppShell.tsx). There is no URL router for these modules. Every data page requires `activeBusiness` from `BusinessContext`. Queries observed in the UI pass `business_id` explicitly. That is not a substitute for RLS.

| Module | UI | Data path in source | Classification |
|---|---|---|---|
| Dashboard | `src/components/pages/DashboardPage.tsx` via `src/lib/workspace-bootstrap.ts` | Counts and recent rows for orders, customers, conversations (`kind = customer`), leads, tasks, low stock, activity, `ai_insights`. Bootstrap RPC is bound in `workspace-bootstrap.ts`. | Implemented in source. Live numbers UNTESTED in this task. |
| Products | `src/components/pages/ProductsPage.tsx` | `products` insert/update/delete, `adjust_product_stock` RPC, image storage migrations exist. | Operational CRUD present in source. Stock and image behavior UNTESTED live. |
| Orders and payments | `src/components/pages/OrdersPage.tsx`, `src/components/settings/BusinessPaymentsTab.tsx` | `create_order_atomic`, `record_manual_bank_transfer`, `review_manual_bank_transfer`. Payment settings upsert `business_payment_settings`. Packet `ABOS-PAY-001` exists. | Order creation and manual transfer review are implemented in source. Gateway payments are not this path. Live RPC success UNTESTED here. |
| Customers | `src/components/pages/CustomersPage.tsx` | `customers` select/insert/update/delete scoped by business in the client. | CRUD present. Authorization of non-owners UNTESTED live. |
| Leads | `src/components/pages/LeadsPage.tsx` | `leads` CRUD, `convert_lead_to_customer` RPC, `activity_events` inserts. | Conversion workflow exists in source. RPC and RLS UNTESTED live. |
| Conversations | `src/components/pages/ConversationsPage.tsx` | Reads conversations/messages; send goes through `whatsapp-send`. | UI exists. Live WhatsApp send/receive is a known deferred dependency (Embedded Signup / Business Verification). Not proven by this tree. |
| AI Agent | `src/components/pages/AgentPage.tsx` | Owner/admin/agent only. Session id in `localStorage`. Invokes `abos-ai-agent`. Reads `conversations` and analysis. | Workspace UX packet `ABOS-AI-002` is marked merged. Live "understanding" checkbox in that packet is still open. |
| Tasks | `src/components/pages/TasksPage.tsx` | `tasks` select/insert/update/delete plus `activity_events`. | Status workflow exists. Link columns are unused by the UI. See recommended slice. |
| Analytics | `src/components/pages/AnalyticsPage.tsx` | Loads all `orders` with `order_items` for the business, aggregates in the browser. | Charts exist. No error branch: a failed query leaves loading false and empty data. Unbounded read. UNTESTED at real volume. |
| Automations | `PlaceholderPage` in `AppShell.tsx` | Table `public.automations` and `automation_runs` created in `supabase/migrations/20260921174026_20260921090000_abos_operating_core.sql`. | PLACEHOLDER UI. Schema is not an engine. No runner found in `src/`. |
| Settings / profile | `src/components/pages/SettingsPage.tsx` | Tabs actually rendered: business, payments (owner), ai, knowledge, whatsapp, team, danger. | Functional categories exist. There is no Automations settings tab. Business profile writes are owner-gated in the component. Live RLS UNTESTED. |

`src/components/pages/PlaceholderPage.tsx` is only used for Automations.

## 2. SET-001 verification (do not treat as done)

Packet `.abos/tasks/ABOS-SET-001-business-ai-controls.md` still says **In progress**. Its checkpoint says source inspection was done and live authorization, testing, and deployment were outstanding.

What `main` already contains:

- Migration file `supabase/migrations/20261022203041_business_ai_settings.sql`.
  - Table `public.business_ai_settings` keyed by `business_id`.
  - Checks: `language_mode` in `automatic|pidgin|standard_english|professional_english`; `tone` in `friendly|professional|casual`; `response_length` in `concise|balanced|detailed`.
  - RLS enabled. Select: `private.is_business_member`. Insert/update: `private.has_business_role(..., ['owner','admin'])`. No delete policy.
- Settings UI: `AiAgentSettingsTab` in `src/components/pages/SettingsPage.tsx` (load around line 528, upsert around line 550). `canEdit` is owner or admin. Viewers see a read-only notice.
- Agent: `supabase/functions/abos-ai-agent/index.ts` selects `language_mode,tone,response_length` and applies tone, length, and language instructions (around lines 263, 349, 1261–1314, 1974). Missing row defaults to automatic / friendly / balanced.

Not proven:

- That this migration is applied on the production project.
- That production policies match the file.
- That an agent or viewer is rejected on a direct upsert.
- That a saved language mode changes a real customer reply.
- Edge Function deploy revision versus this source.

Do not add a second migration or a second settings feature. The next SET-001 action is live verification, not a rewrite.

## 3. Other proven vs untested

**Proven from source (implementation exists):**

- Eleven nav entries; ten have page modules; Automations does not.
- Business-scoped client filters on the modules listed above.
- Role helper `private.has_business_role` in `supabase/migrations/20261018041441_enforce_business_role_permissions.sql`.
- Task link columns already exist: `tasks.related_customer_id`, `tasks.related_lead_id` (`abos_operating_core.sql`). Indexes exist in `20260921174337_20260921093000_abos_core_indexes_and_security_fix.sql`.
- Notes table exists. No notes page was found under `src/components/pages`.

**Incomplete or placeholder:**

- Automations page is a placeholder. `automations` rows are never read by application code found in `src/`.
- Tasks UI selects only `id,title,description,status,priority,due_at,created_at`. It never reads or writes `related_customer_id`, `related_lead_id`, or `assigned_to`.
- Leads UI does not create a follow-up task when status changes.
- Analytics ignores query errors.

**Live schema correction (2026-11-10, after this report was first committed):**

The source-only claim below was wrong for production. Live `tasks_insert` and `tasks_update` use `private.has_business_role` with `owner`, `admin`, and `agent`. Viewers cannot write tasks in production. Do not claim viewers can write tasks. Do not change those policies in the follow-up slice. `tasks_delete` remains a separate owner-scoped policy in the tracked migration; this correction does not restate delete.

Tracked migration `20260921174026_20260921090000_abos_operating_core.sql` still shows the older `is_business_member` insert/update policies. Live policies have moved ahead of that file. Treat live as the authorization fact. Do not rewrite history to match the file.

Task link foreign keys are ID-only. `related_customer_id` and `related_lead_id` do not enforce that the referenced row shares the task's `business_id`.

Live counts at correction time: two customer-linked tasks; zero lead-linked tasks; zero existing cross-business customer or lead task links.

`20261022203041_business_ai_settings.sql` is present in live migration history. Do not recreate `business_ai_settings`.

Supabase schema-inspection advisory, recorded only, not remediated:

- Critical: `private.whatsapp_connections` has RLS disabled. Do not apply automatic remediation.
- Two RLS-enabled tables have no policies: `ai_prompt_blocks`, `ai_runtime_config`.
- Seven authenticated-executable `SECURITY DEFINER` functions need review.
- Leaked-password protection is disabled.

## 3b. Original source-only note (superseded for task writes)

**Security source gap (superseded by the live correction above):**

- The first draft said `tasks_insert` and `tasks_update` still allow `private.is_business_member`. That is true of the original tracked SQL and false of live policies. Live writes are owner, admin, and agent only.

**UNTESTED (requires live Supabase, not this task):**

- Applied migration history is not fully diffed here. Exception: `20261022203041_business_ai_settings` is confirmed present in live history.
- Task insert/update role set is verified live (owner, admin, agent). Other table policies are not fully re-verified in this correction.
- Cross-business task links: live count was zero. Other cross-business cases were not exhaustively probed.
- WhatsApp send, webhook, and Embedded Signup.
- `abos-ai-agent` deployed behavior, including SET-001 preferences.
- Dashboard bootstrap RPC on production after `1139d93`.

## 4. Existing packets that already cover gaps

- `ABOS-SET-001-business-ai-controls.md` — AI reply controls. Source largely present. Live acceptance still open.
- `ABOS-SET-002-business-knowledge.md` — knowledge tab exists (`BusinessKnowledgeTab`). Not re-audited line by line.
- `ABOS-SET-003-professional-settings-ux.md` and `ABOS-SET-004-mobile-settings-detail-navigation.md` — settings shell and mobile back-stack are in `SettingsPage.tsx`. Evidence files exist under `.abos/evidence/`.
- `ABOS-PAY-001-payment-settings-and-manual-transfers.md` — payments tab and order transfer RPCs.
- `ABOS-AI-002-agent-workspace-ux.md` — merged; one live check still open.
- `ABOS-AI-001-whatsapp-media-understanding.md`, `ABOS-WA-001-whatsapp-health-check.md` — WhatsApp. Do not make WhatsApp the first Slice 4 slice while connection is deferred.
- No packet owns linked follow-up tasks or the Automations placeholder.

## 5. Three highest-value candidates

1. **Linked follow-up tasks.** Use existing `related_customer_id` and `related_lead_id`. Let an owner create a due follow-up from a lead or customer and see who it is for on Tasks. This is a daily operating loop. No new table.
2. **SET-001 live verification.** Prove the migration, RLS, and reply instruction on production. High trust value, but it is verification of finished source, not a new workflow.
3. **Automations execution.** Highest long-term platform value and the only full placeholder. Too large for the first slice: trigger runner, retries, tenant safety, and idempotency are a program, not a vertical cut.

## 6. Recommended first implementation slice

**Name:** Follow-up tasks linked to a customer or lead.

**Why first:**

- Real workflow: "this person needs a call tomorrow" is how a small business uses an operating system.
- Schema, indexes, and task CRUD already exist. The gap is the UI and the write payload.
- Does not depend on WhatsApp, a new Edge Function, or a new table.
- Dashboard already counts open tasks, so the loop shows up without a new home.
- Smaller and safer than Automations. More user-visible than another settings pass.

Out of scope for that slice: automation runner, notes product, analytics rewrite, WhatsApp, duplicate AI settings.

## 7. Files likely to change

- `src/components/pages/TasksPage.tsx` — load and save link ids; show the related name; keep business_id on every write.
- `src/components/pages/LeadsPage.tsx` — action to create one follow-up task for that lead (and customer id when the lead already has one).
- `src/components/pages/CustomersPage.tsx` — same action for a customer.
- `src/types/database.ts` — only if the Task type omits the existing columns.
- A new task packet under `.abos/tasks/` when ChatGPT scopes it.
- Tests beside the pages only if the repo already tests these modules. Do not invent a framework.

No Edge Function change.

## 8. Database migration

**Required for same-business integrity.** ID-only foreign keys do not enforce matching `business_id`. The implementation packet must add an additive tracked migration (trigger or equivalent) with a preflight that aborts if any cross-business link already exists. Live count of those links at this correction was zero. Do not alter live task RLS. Do not recreate `business_ai_settings`. Do not apply the migration to production from the implementation commit.

## 9. Role and tenant isolation

- Every select/insert/update/delete stays filtered by `activeBusiness.id`. Never accept a client-supplied business id that is not the active membership.
- Related customer and lead ids must be loaded from rows already scoped to that business. The foreign key does not prove same-business. A database guard is required.
- Live task insert and update policies already restrict writes to owner, admin, and agent. Viewers are read-only for those operations. The UI must match that. Do not change the policies.
- Service role and Edge Functions are not needed.
- No secrets, no WhatsApp credential reads, no production SQL execution in the implementation until a packet authorizes it.

## 10. Acceptance, tests, mobile, rollback

Acceptance:

- Creating a task with a customer or lead stores `related_customer_id` / `related_lead_id` and shows the name after refresh.
- A task with neither link still works as it does now.
- Lead and customer actions create one task in the same business, with due date and priority.
- A task cannot be linked to another business's customer or lead.
- Loading, empty, save error, and cancel states stay visible.
- Delete remains the existing owner-scoped behavior.

Tests:

- Typecheck, lint, and build, compared with the known lint baseline rather than claimed green.
- One targeted test if a page test harness already exists; otherwise manual cases above, recorded in `.abos/evidence/`.

Mobile:

- 360, 390, and 430: form and linked names do not overflow horizontally. Primary actions are reachable without a second horizontal scroller.

Rollback:

- Revert the application commit. No migration to roll back if none is added.
- Existing tasks remain valid because new writes only fill nullable columns.

## Stop

No Slice 4 implementation is authorized by this report. Wait for an audited implementation packet.
