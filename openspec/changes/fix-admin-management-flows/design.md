## Context

The project is a Next.js 16 App Router application with Prisma, Server Components, Server Actions, Route Handlers, and Zod validation. The admin shell is client-side because it owns sidebar state and logout behavior, while most admin pages remain Server Components with inline Server Actions and small client wrappers for confirm/autosubmit behavior.

The current implementation already has `/admin`, `/admin/sell-leads`, `/admin/cars-new`, `/admin/brands`, `/admin/categories`, public lead/event APIs, and internal taxonomy APIs. The gaps are mostly product and operational quality: duplicated brand/category pages and routes, inconsistent API response shape, duplicated slug/name normalization, non-unified validation feedback, and admin UI spacing/copy that feels less polished than a dealership management tool.

## Goals / Non-Goals

**Goals:**
- Polish the admin shell using the store logo/brand in the left sidebar with stable menu sizing, spacing, active state, and mobile behavior.
- Make sales leads easier to operate as a funnel: intake, contact, evaluation, follow-up, closed/archived, with filters and actionable state.
- Standardize Route Handler mutation behavior for sales leads, events, brands, and categories using Zod validation and predictable response/error contracts.
- Replace duplicated brand/category management with one adaptive taxonomy management surface.
- Improve `/admin/cars-new` as a managerial registration workflow with clearer field groups, validation treatment, taxonomy creation, and professional operator copy.

**Non-Goals:**
- Do not create a public customer account or checkout flow.
- Do not introduce a new external dependency unless the Executor explicitly reports a justified blocker and gets approval.
- Do not redesign the whole public site.
- Do not change Prisma schema unless implementation finds a durable data requirement that cannot be represented with the existing models.
- Do not weaken admin/internal access checks for mutation endpoints or Server Actions.

## Decisions

### Keep the work as a fix/stabilization branch

This is a `fix` task because it corrects existing admin, lead, taxonomy, and vehicle-entry behavior rather than introducing a separate product module. Recommended branch: `codex/fix-admin-management-flows`.

Alternative considered: split into multiple branches for shell, leads, taxonomy, and cars-new. That would reduce diff size, but the user request intentionally ties these flows together around admin management quality. The Executor should still implement in small commits/sections and stop if the diff becomes hard to review.

### Keep App Router Route Handlers and Server Actions

Public API submissions and client-side taxonomy creation should remain Route Handlers under `src/app/api/**/route.ts`; admin form mutations should remain Server Actions where the page already follows that pattern. Next.js docs confirm Route Handlers are the App Router API surface and Server Actions are POST-reachable mutations, so every Server Action that mutates sensitive data must verify access before mutation when not already protected by layout-level access.

Alternative considered: move all admin mutations to REST endpoints. That would make contracts more uniform, but it would also rewrite existing Server Component forms unnecessarily. Keep the current architecture and only extract shared parsing/response helpers where it removes duplication.

### Use one taxonomy management surface with typed configuration

Create one adaptive admin taxonomy page/component that receives a resource configuration for `brands` and `categories`. The route can be implemented as `/admin/taxonomies/[type]` or another single-route shape chosen by the Executor, but the navigation must present the two business concepts clearly as "Marcas / Fabricantes" and "Categorias / Segmentos".

Alternative considered: keep two pages and extract a shared component only. That reduces routing churn, but it does not satisfy the request for a single route/page. Redirects or compatibility links from the old routes are acceptable if needed to avoid broken bookmarks.

### Standardize API responses without overbuilding versioning

Use a consistent JSON shape for mutations and validation errors across touched APIs. For this project, a minimal envelope is enough:
- success: `{ data: ... }` or direct created resource only if an existing client contract requires it.
- validation error: `{ error: { code, message, details } }`.
- conflict/not found/auth errors: same `error` object with correct HTTP status.

REST remains the correct style because these are resource-oriented endpoints (`brands`, `categories`, `sales-leads`, `commercial-events`) consumed by the same Next.js app. No GraphQL/tRPC/versioned API layer is needed for this internal app.

Alternative considered: introduce a formal `/api/v1` version and global envelope everywhere. That is not necessary while the API is first-party and small; the Executor should avoid broad churn outside touched endpoints.

### Centralize normalization and validation

Slug generation, case/accent-insensitive duplicate checks, money parsing expectations, enum validation, and safe metadata handling should live in shared helpers/schemas instead of each route/page hand-rolling slightly different rules. The current code already has `src/lib/schemas.ts` and `src/lib/api.ts`; extend those before adding new helper files.

Alternative considered: normalize directly in each page/action. That repeats mistakes already visible in brand/category APIs and makes future maintenance harder.

## Risks / Trade-offs

- [Risk] A single large admin change can become difficult to review. -> Mitigation: Executor should keep route shell, taxonomy, lead API/funnel, and cars-new changes in clearly separated sections and report changed files by area.
- [Risk] Redirecting or replacing `/admin/brands` and `/admin/categories` can break existing links. -> Mitigation: keep compatibility redirects or lightweight wrappers until navigation and internal links are updated.
- [Risk] Changing API response shapes can break current `CarForm` client calls. -> Mitigation: update clients in the same task and preserve minimal backwards-compatible fields where easy, such as returning `{ id, name }` inside `data` or directly during transition.
- [Risk] Server Actions are reachable by POST. -> Mitigation: verify current user/role inside sensitive mutations or extract actions to a module that performs authorization consistently.
- [Risk] Build may require `DATABASE_URL` for Prisma-backed admin prerender paths. -> Mitigation: run lint/typecheck first, run build with available env, and report env-blocked build separately if it occurs.

## Migration Plan

1. Create branch `codex/fix-admin-management-flows` from current `main`.
2. Implement UI shell polish and navigation compatibility first.
3. Introduce shared API/validation helpers and update touched Route Handlers.
4. Build adaptive taxonomy route/page, then replace old brand/category pages with redirects or wrappers.
5. Improve sell-leads funnel and `/admin/cars-new` after shared helpers exist.
6. Run `npm run lint`, `npm run typecheck`, `npm run build`, and focused tests if added.
7. Rollback strategy: revert the branch before merge; if only taxonomy route causes issues, keep old pages as wrappers and roll back the navigation target.

## Open Questions

- Confirm whether the store logo is already available in `public/` or should be represented by existing Lima Automoveis branding text/monogram until an asset is provided.
- Confirm the preferred final route shape for taxonomy management if the Executor finds a strong reason to choose between `/admin/taxonomies/[type]`, `/admin/catalogo/[type]`, or `/admin/cadastros/[type]`.
