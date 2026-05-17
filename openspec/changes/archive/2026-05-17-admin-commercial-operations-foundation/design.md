## Context

The application is a Next.js 16 App Router dealership site with public inventory pages, an admin panel, Prisma/PostgreSQL, server actions, and admin-only APIs. The current codebase still contains user-facing e-commerce concepts such as cart and favorites, but the dealership workflow is WhatsApp-led: visitors inspect vehicles, ask for financing or sale/consignment support, and the actual negotiation happens through WhatsApp and internal operators.

The existing admin area already has a shell, users page, sell-leads page, vehicle creation page, and FIPE comparison page. These should remain mostly server-rendered, using small client components only where interactivity is necessary. The foundation change must preserve the approved public page redesign now present in `main`.

## Goals / Non-Goals

**Goals:**

- Make admin access explicitly internal: operators and admins only.
- Replace the public cart/favorites mental model with commercial leads and events.
- Record measurable commercial actions: vehicle view, WhatsApp click, financing interest, sell/consignment interest, and contact intent.
- Give `/admin` useful filters and metrics based on real operational events and leads.
- Make FIPE and pricing behavior explicit: provider, confidence, parameters, fallback, margin, and manual review.
- Make vehicle creation easier for operators by separating public listing fields from internal commercial fields.
- Keep changes split into reviewable phases so admin, API, FIPE, and vehicle form changes do not become one unreviewable diff.

**Non-Goals:**

- No public checkout, online payment, order management, or cart-based purchase flow.
- No WhatsApp Business API automation in this foundation change.
- No external analytics platform dependency.
- No full CRM replacement.
- No removal of admin authentication.
- No large visual redesign of approved public pages beyond required CTA/event wiring.

## Decisions

1. Public conversion is modeled as leads and commercial events, not carts.

   The primary purchase CTA should generate a WhatsApp URL with vehicle context and record a commercial event before redirecting or linking out. Favorites and cart APIs can be deprecated or hidden from public UI because they require public accounts that do not match the dealership process.

   Alternative considered: keep cart/favorites as interest signals. This was rejected because it keeps the UI and data model tied to a checkout flow that the business does not use.

2. Access management is internal operator management.

   `/login` remains the entry point for admin and operator accounts. `/register` stays disabled or redirects. `/admin/users` should use labels such as "operadores" and "acessos internos" instead of customer/user account language.

   Alternative considered: add public customer accounts for tracking. This was rejected because WhatsApp is the negotiation channel and public login would add friction before the business has a clear post-login product.

3. Commercial events are first-party records in Prisma.

   A `CommercialEvent`-style model should store event type, optional vehicle, optional lead, source path, CTA label or campaign, contact channel, metadata, and timestamps. The event API should accept only a narrow whitelist of event types and safe metadata.

   Alternative considered: use only server logs or external analytics. This was rejected because the admin dashboard needs queryable business data without adding a new dependency.

4. Sales lead API is a domain API, not a checkout API.

   Lead capture should normalize customer intent across `/vender`, `/financiamento`, `/contato`, vehicle detail WhatsApp clicks, and manual admin registration. Leads should carry status, source, channel, related vehicle when available, and a simple note/history trail.

   Alternative considered: keep independent page-specific forms. This was rejected because the dashboard and admin triage need one commercial pipeline.

5. Dashboard metrics are period-filtered and source-aware.

   `/admin` should default to recent operational periods, such as 7 or 30 days, and expose filters for period, event type, source page, channel, and lead status. Metrics should include open leads, WhatsApp clicks, vehicle views, conversion from view to WhatsApp, financing interest, sell/consignment interest, FIPE coverage, and vehicles needing attention.

   Alternative considered: static lifetime counts. This was rejected because the user needs an operational dashboard, not a database inventory summary.

6. FIPE remains provider-backed with manual confirmation.

   The app can use FipeX where available and local stock comparison as secondary support, but FIPE output must show source, reference month, confidence, and fallback state. Bike/electric-bike cases remain manual unless a reliable provider is added later.

   Alternative considered: treat provider values as final pricing. This was rejected because pricing depends on vehicle state, cost, margin target, and negotiation context.

7. Vehicle creation should be organized by operator responsibility.

   The form should separate sections for public listing, internal pricing/cost, FIPE/comparison, operational status, media, and commercial notes. Labels should explain responsibility without exposing internal fields to the public listing.

   Alternative considered: keep a single long form. This was rejected because the form already has rich behavior and needs clearer operator flow before adding more parameters.

## Risks / Trade-offs

- Public tracking without login can overcount repeated visits -> Deduplicate only where practical and treat events as operational indicators, not exact people counts.
- Recording commercial events can collect sensitive data accidentally -> Keep event metadata whitelisted and avoid storing free-form personal data in event rows.
- Removing visible cart/favorite behavior may surprise if code paths still exist -> Hide or neutralize public UI first, then deprecate APIs/schema in a later cleanup if needed.
- Dashboard metrics can become expensive as events grow -> Add indexes on event type, vehicle, lead, source, and created date.
- WhatsApp click tracking can be blocked by browser navigation timing -> Use a lightweight endpoint or `sendBeacon`-style client helper before opening the WhatsApp URL.
- FIPE provider failures can degrade the vehicle form -> Keep manual entry and local comparison as valid fallbacks.
- Broad admin changes can become hard to review -> Split implementation into phases and keep each PR scoped around one capability slice.

## Migration Plan

1. Keep the approved public page commit in `main` before admin work starts.
2. Add commercial event and lead-source schema changes with a Prisma migration.
3. Wire event capture to public CTAs and vehicle detail WhatsApp links.
4. Update admin access labels and remove customer-facing account assumptions.
5. Build dashboard metrics from event/lead data with filters.
6. Refine FIPE and vehicle creation flows after the event and lead foundation exists.
7. Rollback by disabling event writes and preserving existing lead/admin tables; no customer-facing checkout state is required for business continuity.

## Open Questions

- What official WhatsApp number should be used for vehicle purchase, financing, and sell/consignment CTAs?
- Should operators manually register WhatsApp leads received outside the website in `/admin/sell-leads`, or should there be a faster "manual lead" action from the dashboard?
- Should public cart/favorite database tables be removed now or left deprecated until after dashboard/event metrics are stable?
- Which periods are most useful by default for the dashboard: today, 7 days, 30 days, month-to-date?
