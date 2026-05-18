## Why

The admin area already has the operational pieces, but the experience is fragmented: the sidebar branding and spacing need refinement, sales lead handling lacks a stronger funnel/API contract, brand/category management is duplicated across two similar routes, and vehicle creation still mixes guidance, layout, and validation concerns. This change stabilizes the management flows before adding more inventory and commercial features on top of them.

## What Changes

- Polish the `/admin` shell with the store logo on the left, tighter menu sizing, clearer active states, and consistent spacing between sidebar, header, and content.
- Improve `/admin/sell-leads` as a funnel-oriented operations page with clear stages, filters, data entry, follow-up treatment, and API-backed lead/event handling where needed.
- Standardize sales lead and commercial event API behavior around validated inputs, consistent error responses, safe metadata, and measurable conversion events.
- Replace the duplicated `/admin/brands` and `/admin/categories` management experience with one adaptive taxonomy route/page that can manage brands/fabricantes and categories/segmentos from the same reusable surface.
- Improve `/admin/cars-new` layout, field grouping, required/optional treatment, validation feedback, API interactions, and operator copy so the page feels managerial and professional without non-actionable messages.
- Keep the work classified as a fix/stabilization task; no new dependency is expected unless explicitly approved during implementation.

## Capabilities

### New Capabilities
- `admin-taxonomy-management`: Covers the adaptive admin taxonomy management route for brands/fabricantes and categories/segmentos.

### Modified Capabilities
- `commercial-operations`: Strengthens the sales lead funnel, operational lead treatment, and commercial event/API expectations.
- `vehicle-registration-operations`: Refines the `/admin/cars-new` registration workflow, field grouping, validation, and API-assisted taxonomy creation.

## Impact

- Affected UI/routes: `src/components/AdminShell.tsx`, `src/components/admin/admin-navigation.ts`, `src/app/admin/page.tsx`, `src/app/admin/sell-leads/page.tsx`, `src/app/admin/brands/page.tsx`, `src/app/admin/categories/page.tsx`, `src/app/admin/cars-new/page.tsx`, and `src/components/admin/CarForm.tsx`.
- Affected APIs/helpers: `src/app/api/sales-leads/route.ts`, `src/app/api/commercial-events/route.ts`, `src/app/api/brands/route.ts`, `src/app/api/categories/route.ts`, `src/lib/api.ts`, `src/lib/schemas.ts`, and shared repository/helpers if introduced.
- Affected data model: existing Prisma models `Brand`, `Category`, `SellLead`, `CommercialEvent`, and `Car`; schema changes are not expected unless implementation finds a missing durable field that cannot be represented safely today.
- Validation gate: `npm run lint`, `npm run typecheck`, `npm run build`, and focused tests where available or added.
