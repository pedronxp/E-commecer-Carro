## Why

The `/admin/promotions` standalone comparison already calculates FIPE, target margin, store purchase value, and decision cards, but the current presentation still leaves key business terms ambiguous for operators and managers. This change makes the flow self-explanatory, improves the analytical FIPE reading, and upgrades chart/loading presentation so the recommendation can be understood without extra training.

## What Changes

- Clarify how the target margin enters the recommendation, including minimum acceptable sale price, maximum recommended purchase value, gross margin, and risk copy.
- Expand vehicle condition handling so each condition option explains its commercial effect and the selected condition is visible in the decision output.
- Rename or explain ambiguous labels such as lower/higher difference, FIPE trend, and reference quality with client/manager-friendly wording.
- Improve the analytical FIPE section with structured interpretation of history, volatility, minimum/maximum spread, source confidence, and recommended commercial reading.
- Improve FIPE chart readability with richer visual states, annotations, spacing, legends, and explicit copy that separates FIPE reference data from sale forecast.
- Redesign the comparison loading modal using Lima Automotiva branding, clearer progress steps, and responsive light/dark treatment.
- Position the page as the internal "Precificador sem cadastro" product and use "valor de compra da loja" for the acquisition value so managers understand that it is the amount the store paid or wants to pay before stock registration.
- Remove stock-empty, stock-filter, and stock-diagnostic panels from the sem-cadastro pricing surface so the page does not tell the operator to register inventory before using this product.
- Remove stock-registered KPI cards from the sem-cadastro pricing surface so stock metrics do not compete with the comparison product.
- Clarify that conservation is an internal commercial adjustment over the FIPE/FipeX reference and that FIPE by UF/state is not available in the current provider flow.
- Add UF as market context in the form/API response while explicitly marking the current FIPE/FipeX motor as national and regional pricing as unsupported until a real source is connected.
- Add Basic, Plus, and Advanced recommendation report modes, where Basic reduces noise, Plus adds managerial FIPE/source context, and Advanced adds funnel/formula/technical chart explanation.
- Add a separate regional liquidity intelligence layer that estimates best purchase price, purchase risk, resale likelihood, and listing range using UF context, FIPE trend/spread, local samples, and transparent source notes without changing the national FIPE value.
- Reframe the primary result around "melhor preco para comprar" so the store purchase value is treated as real acquisition outlay before the listing recommendation.
- Make the compare loading treatment cover the whole viewport above the admin shell and explain each processing step before the recommendation appears.
- Improve admin form standards so labels, help text, inputs, selects, actions, validation/empty states, and grouped sections follow one predictable pattern.
- Add responsive layout requirements for all relevant admin screen patterns, including dashboards, forms, filters, cards, tables/lists, modals, charts, empty states, and loading states.
- Keep the flow focused on current commercial negotiation guidance, not future sale prediction or guaranteed closing price.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `commercial-operations`: Strengthen `/admin/promotions` standalone comparison requirements for self-explanatory decision cards, condition/margin treatment, branded loading, admin form standards, responsive layouts, stock-KPI removal, report modes, and manager-readable chart/cards.
- `fipe-pricing-workflow`: Strengthen FIPE pricing requirements for analytical FIPE reading, reference quality explanation, trend interpretation, chart treatment, UF context, explicit national/regional source status, and additive market-liquidity metrics.

## Impact

- Affected UI: `/admin/promotions`, especially standalone comparison form, result cards, FIPE timeline/chart sections, analytical FIPE cards, and comparison loading modal; shared admin screen/form patterns should be aligned where this change touches or reuses them.
- Affected components/helpers likely include `src/app/admin/promotions/page.tsx`, `src/components/admin/PromotionCompareForm.tsx`, shared admin shell/form components, FIPE/price timeline helpers, and pricing comparison helpers.
- No new external dependency is expected; prefer existing React, Next.js, Tailwind/CSS, `lucide-react`, and local helper patterns.
- No database migration is expected unless implementation discovers missing persisted taxonomy data for condition options; the default plan is UI/domain-copy refinement over existing data.
