## Why

The current product still mixes a classic logged-in e-commerce model with the real dealership workflow, where public visitors choose a vehicle or submit interest and the negotiation continues through WhatsApp and internal operators. This change creates the operational foundation needed before improving the admin dashboard, FIPE comparison, sales APIs, and vehicle creation flow.

## What Changes

- Reframe public customer actions as commercial leads and events instead of cart/favorite activity.
- Keep authentication focused on internal operators and administrators, with no public account workflow in the customer journey.
- Introduce a commercial event model for vehicle views, WhatsApp clicks, financing interest, sale/consignment interest, and other measurable conversion points.
- Add sales lead API behavior that records customer intent, source page, related vehicle when available, preferred channel, and status transitions.
- Prepare `/admin` dashboard requirements around periods, filters, funnel metrics, WhatsApp conversion, lead status, FIPE coverage, and vehicle performance.
- Define FIPE comparison requirements around parameters, provider confidence, manual fallback, margin targets, and vehicle registration integration.
- Improve the vehicle creation flow as an operator tool, separating public vehicle data, internal pricing/cost data, FIPE reference, commercial parameters, and media.
- **BREAKING**: Public cart and favorite behavior should no longer be treated as part of the primary buying journey; customer conversion should be tracked through WhatsApp/lead events.

## Capabilities

### New Capabilities

- `commercial-operations`: Internal operator workflow for access, dashboard metrics, sales lead triage, commercial events, WhatsApp conversion, and admin filtering.
- `fipe-pricing-workflow`: FIPE and pricing workflow covering lookup parameters, provider confidence, manual fallback, margin calculation, and integration with vehicle creation.
- `vehicle-registration-operations`: Operator-focused vehicle creation behavior, including field responsibility, labels, internal/public separation, and validation rules.

### Modified Capabilities

None.

## Impact

- Affected routes: `/admin`, `/admin/users`, `/admin/sell-leads`, `/admin/promotions`, `/admin/cars-new`, `/carros/[slug]`, `/vender`, `/financiamento`, `/contato`, `/login`, and `/register`.
- Affected APIs: `/api/auth/*`, `/api/cart`, `/api/favorites`, `/api/cars`, `/api/admin/price-insights`, `/api/admin/fipe-suggestions`, and new or revised commercial lead/event endpoints.
- Affected data model: Prisma models around users/operators, leads, commercial events, vehicle pricing/FIPE metadata, and possibly deprecating cart/favorite usage.
- Affected UI components: admin shell/navigation, dashboard cards/filters, vehicle form, lead management cards, vehicle detail CTA, and public WhatsApp CTAs.
- Dependencies should remain unchanged unless a later task explicitly justifies a provider SDK or analytics dependency.
