## 1. Branch And Baseline

- [x] 1.1 Confirm the implementation branch is based on `main` at or after `ee7306d`.
- [x] 1.2 Confirm approved public pages remain intact before editing admin or API code.
- [x] 1.3 Remove or ignore temporary root PNG files so they do not enter the admin/API commit.
- [x] 1.4 Read local Next.js 16 docs for App Router server/client boundaries before implementation.

## 2. Data Model And API Foundation

- [x] 2.1 Add a Prisma commercial event model with event type, source path, channel, vehicle relation, lead relation, safe metadata, and indexes.
- [x] 2.2 Add lead source/channel/related-vehicle fields needed for WhatsApp, financing, contact, and sell/consignment attribution.
- [x] 2.3 Create or update Zod schemas for commercial event and sales lead input validation.
- [x] 2.4 Add a narrow commercial event endpoint that accepts only allowed event types and safe metadata.
- [x] 2.5 Update sales lead API/server-action behavior to normalize purchase, financing, sell, consignment, and contact intent.
- [x] 2.6 Add tests for event schema, lead schema, invalid metadata, and safe numeric/date parsing.
- [x] 2.7 Run `npx prisma generate` and verify the migration is small and reversible.

## 3. Public Conversion Wiring

- [x] 3.1 Replace public vehicle purchase action with WhatsApp-first CTA carrying vehicle context.
- [x] 3.2 Record vehicle detail views as commercial events without requiring public login.
- [x] 3.3 Record WhatsApp clicks from vehicle detail, contact, financing, and sell/consignment flows.
- [x] 3.4 Hide or neutralize cart/favorite UI from the public buying journey.
- [x] 3.5 Keep `/register` disabled for public users and ensure public pages do not encourage customer login.
- [x] 3.6 Verify public CTAs still work without an authenticated session.

## 4. Internal Access Model

- [x] 4.1 Update `/admin/users` language from customer/user account language to operator/admin access language.
- [x] 4.2 Ensure only authorized admin/operator roles can access operational admin routes.
- [x] 4.3 Preserve protection against deleting or demoting the last admin.
- [x] 4.4 Update admin navigation label from generic access/users to internal accesses/operators where appropriate.
- [x] 4.5 Verify login remains admin-focused and public registration remains unavailable.

## 5. Dashboard Operations

- [x] 5.1 Add dashboard filter parsing for period, source, channel, event type, and lead status.
- [x] 5.2 Query commercial events and leads by selected filters using indexed fields.
- [x] 5.3 Show operational metrics for open leads, new leads, WhatsApp clicks, vehicle views, view-to-WhatsApp conversion, financing interest, and sell/consignment interest.
- [x] 5.4 Surface vehicles with high views and low WhatsApp clicks as review opportunities.
- [x] 5.5 Surface leads with pending or overdue next actions.
- [x] 5.6 Keep dashboard layout dense, scannable, and admin-oriented without marketing hero treatment.

## 6. FIPE And Pricing Workflow

- [x] 6.1 Update FIPE provider output to expose provider, matched title, reference month, confidence, and fallback state consistently.
- [x] 6.2 Update `/api/admin/price-insights` to return explicit pricing parameters and manual fallback reasons.
- [x] 6.3 Update `/admin/promotions` to show standalone comparison and registered vehicle comparison with source and confidence.
- [x] 6.4 Preserve manual pricing when provider lookup fails or the operator overrides automatic values.
- [x] 6.5 Highlight negative or risky margin states clearly.
- [x] 6.6 Add or update tests for FIPE mapping, match scoring, fallback behavior, and margin calculation where logic is extracted.

## 7. Vehicle Registration Operations

- [x] 7.1 Split the vehicle creation form into clear sections for public listing, internal pricing, FIPE/comparison, operational status, media, and notes.
- [x] 7.2 Improve labels and helper text for price, purchase cost, FIPE, brand, category, location, and media responsibility.
- [x] 7.3 Ensure vehicle type still adapts fields for car, motorcycle, and electric bike.
- [x] 7.4 Prevent automatic FIPE suggestions from overwriting manually edited values.
- [x] 7.5 Ensure local image guidance distinguishes actual vehicle photos from generated public banners.
- [x] 7.6 Verify vehicle creation remains usable when FIPE suggestions or price insights fail.

## 8. Validation And Review

- [x] 8.1 Run `git diff --check`.
- [x] 8.2 Run `npx prisma generate`.
- [x] 8.3 Run `npm run lint`.
- [x] 8.4 Run `npm run typecheck`.
- [x] 8.5 Run `npm run test`.
- [x] 8.6 Run `npm run build`.
- [x] 8.7 Smoke test public vehicle detail, WhatsApp CTA, `/vender`, `/financiamento`, `/admin`, `/admin/sell-leads`, `/admin/promotions`, `/admin/cars-new`, and `/admin/users`.
- [x] 8.8 Return executor summary with changed files, validation results, risks, and reviewer notes.

## 9. Review Corrections

- [x] 9.1 Align internal operator access so `USER` operators can use operational admin routes while access management stays restricted to `ADMIN`.
- [x] 9.2 Replace dashboard commercial-event metric sampling with database-level counts/grouping over the full selected filter period.
- [x] 9.3 Make dashboard lead-status filtering explicit and consistent across lead metrics and lists.
- [x] 9.4 Rerun OpenSpec validation, Prisma generation, lint, typecheck, tests, build, and review after corrections.
