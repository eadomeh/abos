# ABOS-PAY-001 — Payment Settings and Manual Transfer Review

## Goal
Allow the business owner to configure safe, business-scoped bank-transfer instructions and let authorized staff record transfer claims while requiring owner/admin human verification before a claim is marked verified.

## Current source evidence (read-only, 2026-10-22)
- Canonical branch is `main`, observed HEAD `a04e680b0c7c6e0a3f91a4e20d105c224b869f67`.
- Live schema had `orders` and `order_items`, but no payment settings or payment report table.
- `orders.status` only allows `pending`, `completed`, `cancelled`; it is not a settlement state and must not be used to assert payment.
- Existing permissions use `private.is_business_owner`, `private.is_business_member`, and `private.has_business_role`.

## Scope
- Dedicated owner-only Settings section for bank name, beneficiary/account name, account number, transfer enablement and extra customer instructions.
- Live preview includes an explicit pending-until-human-verification warning.
- RLS isolates bank details to the business owner. Customer AI receives account details only through a business-scoped payment-instructions tool, and only when requested.
- Add payment reports linked to orders. Staff can record a claim as `pending`; owner/admin can review to `verified` or `rejected` through guarded database functions. Review actor/time and activity events are recorded.
- Never expose bank details through `business_knowledge`; never accept receipt screenshots or customer claims as settlement proof; never auto-complete the order after a payment review.

## Acceptance criteria
- Owner can save and reload complete bank details and customer instructions.
- Disabled or incomplete bank transfer settings are never returned by the AI payment-instructions tool.
- Owner/admin/agent may record a transfer claim only for an existing pending order and only when bank transfer is enabled; viewer cannot write.
- Only owner/admin can review a pending claim. Only a human-selected `verified` decision changes its payment status.
- One pending and one verified transfer maximum per order; rejected claims may be retried.
- RLS prevents direct INSERT/UPDATE/DELETE of payment reports; reads are business-scoped.
- Order lifecycle status is not modified by payment verification.
- Typecheck, targeted ESLint, production build and `git diff --check` pass before feature-branch commit.

## Migration
`20261022222500_business_payment_settings_and_manual_transfers.sql`; exact SQL in this file is the intended database migration. It is not applied by this runner.

## Rollback
Revert the feature branch before deployment. If the additive migration has been applied later, leave existing rows intact and use a separately reviewed rollback plan rather than silently dropping payment records.
