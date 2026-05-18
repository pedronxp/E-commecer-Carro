## 1. Branch and Baseline

- [x] 1.1 Create or confirm branch `codex/fix-admin-management-flows` from the current validated `main`.
- [x] 1.2 Read `AGENTS.md`, `docs/llm-workflow.md`, the OpenSpec artifacts for this change, and the relevant Next.js 16 docs before editing.
- [x] 1.3 Capture baseline with `git status --short --branch`, current admin route list, and available validation scripts.

## 2. Admin Shell and Navigation

- [x] 2.1 Update `src/components/AdminShell.tsx` to show the store logo/brand mark on the left with stable expanded/collapsed sizing and accessible labels.
- [x] 2.2 Refine sidebar menu item height, spacing, active state, collapsed state, mobile overlay, header alignment, and main content offset.
- [x] 2.3 Update `src/components/admin/admin-navigation.ts` so taxonomy navigation points to the chosen single adaptive taxonomy route while preserving clear labels for brands/fabricantes and categories/segmentos.

## 3. Shared API and Validation Helpers

- [x] 3.1 Extend `src/lib/api.ts` with structured JSON response helpers for success, validation errors, auth errors, conflict, not found, and server errors.
- [x] 3.2 Extend `src/lib/schemas.ts` or a nearby shared helper with reusable slug/name normalization, duplicate-safe taxonomy parsing, and safe API input treatment.
- [x] 3.3 Update touched Route Handlers to use consistent status codes and safe error payloads without exposing internal exception details.

## 4. Adaptive Taxonomy Management

- [x] 4.1 Build one adaptive taxonomy management page/component for brands/fabricantes and categories/segmentos using typed resource configuration.
- [x] 4.2 Implement the chosen single route shape, with compatibility redirects or wrappers for `/admin/brands` and `/admin/categories`.
- [x] 4.3 Update brand/category create, update, and delete flows to validate names, normalize slugs, prevent duplicates, block deletion while linked to vehicles, and revalidate affected admin pages.
- [x] 4.4 Preserve category suggestions where useful and ensure both taxonomy modes show linked vehicle counts and actionable empty states.

## 5. Sales Lead Funnel and Commercial APIs

- [x] 5.1 Improve `/admin/sell-leads` with funnel-oriented metrics, filters, status grouping, follow-up due/overdue treatment, and clearer operator actions.
- [x] 5.2 Strengthen lead Server Actions with explicit internal access checks, status/channel/date validation, safe note append behavior, and dashboard revalidation.
- [x] 5.3 Update `src/app/api/sales-leads/route.ts` and `src/app/api/commercial-events/route.ts` to use shared validation/response helpers and preserve public lead/event submission behavior.
- [x] 5.4 Verify funnel counts exclude archived/anonymized leads from active operational metrics and keep closed leads visible for reporting.
- [x] 5.5 Extend `/admin/promotions` with a guided comparison dialog that explains the standalone vehicle flow.
- [x] 5.6 Extend `/api/admin/price-insights` so authenticated consumers can request a complete pricing decision with suggested price, gross margin, and margin percent.
- [x] 5.7 Add standalone comparison autocomplete so typing a vehicle model can suggest FIPE/FipeX models across available years before running the comparison.
- [x] 5.8 Improve the pricing guide SVG and make the admin menu collapse when the operator clicks outside the sidebar.
- [x] 5.9 Improve `/admin/promotions` with managerial pricing diagnostics, adjustment potential, standalone next-action guidance, and per-vehicle pricing status.
- [x] 5.10 Clarify standalone comparison inputs by showing condition and target margin in the form and explaining cost versus current price.
- [x] 5.11 Format standalone cost/current-price inputs as BRL, prefill current price from the selected model suggestion, and show a 10-year price timeline with min/max values when FipeX history is available.
- [x] 5.12 Separate stock filters from standalone comparison, rename current FIPE price labels, replace timeline bars with a line chart, cap the timeline at the selected year, and improve guide responsiveness.
- [x] 5.13 Add empty filter placeholders, clear actions, safer form remounting on URL changes, and tighter responsive layout for `/admin/promotions`.
- [x] 5.14 Clarify that `Ano` is vehicle model year, add a timeline period control through the current year, and improve model-year chart KPI summaries.
- [x] 5.15 Add field help tooltips, rename acquisition cost to intended payment value, gate stock filters behind existing inventory, and improve sell-lead/admin dashboard operational explanations.
- [x] 5.16 Add compare loading animation, clarify suggested price/gross margin formulas, rename match/amplitude labels, and extend the model-year axis to the current year without inventing missing FIPE values.
- [x] 5.17 Enforce a minimum compare-loading duration, add backend guidance to pricing insights, and mark unpriced years in the expanded model-year chart.
- [x] 5.18 Clarify timeline period modes, separate FIPE reference period from visual axis, and centralize session/consent cookie treatment.
- [x] 5.19 Extract FIPE timeline rules into a tested domain helper, show leading timeline gaps, and separate unauthorized session cleanup from generic API errors.
- [x] 5.20 Improve FIPE chart spacing, move comparison loading to a centered blur/motion modal, collapse the comparison form after results, and clarify suggested price is not a future-sale forecast.
- [x] 5.21 Tighten pricing API candidate filters, replace one-point FIPE charts with an explicit SVG state, remove distracting loading backdrop stripes, and show a delayed recovery message if comparison navigation stalls.

## 6. Vehicle Creation Workflow

- [x] 6.1 Refine `/admin/cars-new` page structure and `src/components/admin/CarForm.tsx` into clear managerial sections for public listing data, pricing/FIPE, taxonomy, media, and internal controls.
- [x] 6.2 Improve required/optional field treatment, validation messages, loading states, and fallback messages so every message tells the operator what to do next.
- [x] 6.3 Update in-form taxonomy creation to use the shared API contract, handle duplicates/auth/validation distinctly, and keep form state intact after failures.
- [x] 6.4 Recheck vehicle type behavior for car, motorcycle, and electric bike so unsupported FIPE calls are avoided and irrelevant fields stay hidden.

## 7. Verification and Handoff

- [x] 7.1 Run `npm run lint`.
- [x] 7.2 Run `npm run typecheck`.
- [x] 7.3 Run `npm run build` and report separately if blocked by missing environment such as `DATABASE_URL`.
- [x] 7.4 Add or update focused tests if shared validation/API helpers gain meaningful logic.
- [x] 7.5 Manually inspect the changed admin routes in a browser at desktop and mobile widths if the dev server can run.
- [x] 7.6 Return Executor handoff with summary, changed files, validation commands/results, risks, and reviewer notes.
