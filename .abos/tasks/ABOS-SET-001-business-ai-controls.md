# ABOS-SET-001 — Business-Scoped AI Reply Controls

Status: In progress
Priority: High

## Objective

Add persistent, per-business AI customer-reply preferences to the existing
ABOS Settings page without redesigning unrelated modules.

## Scope

- Add an AI Agent Settings section to the existing Settings page.
- Support automatic language, Nigerian Pidgin, standard English, and
  professional English.
- Support configurable reply tone and response length.
- Persist preferences per business in a dedicated database table.
- Integrate saved preferences into the existing abos-ai-agent reply path.
- Keep automatic defaults compatible with existing behavior.
- Add an additive tracked migration after inspecting live schema and policies.
- Update database types, validation, loading, save, and error states as needed.

## Security requirements

- Verify real schema, migration history, RLS policies, and authorization helpers.
- Enforce business isolation at the database level.
- Permit preference edits only to authorized owners/admins.
- Keep agents and viewers read-only.
- Validate preference values in the server-side AI path.
- Preserve current authentication, business access checks, model fallback,
  and payment/order/inventory safeguards.
- Do not expose secrets or change global AI provider configuration.

## User experience and navigation

- Use a conventional vertical, column-style Settings navigation menu.
- Do not use horizontal tabs or a horizontal scrolling settings row.
- Tapping Settings in the main ABOS navigation opens the Settings page.
- Selecting a category opens its corresponding editable form.
- On desktop, place the vertical category menu beside the content panel.
- On mobile, stack the category menu and selected form cleanly.
- Keep the layout responsive without forcing sideways scrolling.
- Preserve the established ABOS visual identity, styling, and motion.
- Separate Business, AI Agent, Knowledge, Payments, Channels, Team,
  Automations, usage/security, and Danger Zone into clear categories.
- Expose only functional categories; do not add dead navigation items.
- Keep bank details separate from generic profile descriptions and prompts.

## Out of scope

- Editing or staging SET-001-whatsapp-connection-audit.md
- Changing global ai_runtime_config or ai_prompt_blocks
- Changing model/provider defaults
- Bank-account settings
- WhatsApp connection/webhook modifications
- Production migrations or deployment before review

## Acceptance criteria

1. Settings persist per business and load after refresh.
2. Controls work on mobile and show clear loading/save/error states.
3. Unauthorized roles cannot edit settings, including through direct API calls.
4. Businesses cannot access another business's preferences.
5. Explicit language settings affect customer-facing replies.
6. Automatic mode preserves the current behavior when no preference is saved.
7. English-mode safeguards and business-fact grounding remain intact.
8. Typecheck, lint, production build, and relevant targeted tests are run.
9. The final diff and security implications are reviewed before any commit.
10. Actual results and remaining manual acceptance tests are documented.

## Rollback

Use a reviewed revert plan for application changes and the additive migration.
Do not destroy unrelated production data or modify global runtime settings.

## Checkpoint

Source inspection completed. Live database authorization verification,
implementation, testing, and deployment remain outstanding.
The existing WhatsApp audit file must remain unchanged.
