## 1. Preparation

- [x] 1.1 Confirm current branch, dirty working tree ownership, and active OpenSpec change before editing implementation files.
- [x] 1.2 Read the relevant Next.js App Router docs under `node_modules/next/dist/docs/` for any Server/Client Component boundary touched by the implementation.
- [x] 1.3 Inspect current `/admin/promotions` form, decision cards, FIPE analytics, chart helpers, loading overlay, and pricing helpers before changing code.

## 2. Pricing Language and Domain Consistency

- [x] 2.1 Centralize condition option labels, factors, and explanatory copy so the form and result cards use the same conservation treatment.
- [x] 2.2 Ensure target margin copy explains minimum commercial result, maximum recommended purchase value, gross margin, and warning states.
- [x] 2.3 Rename or explain ambiguous card labels for FIPE spread, FIPE trend, and reference quality without changing calculation semantics.
- [x] 2.4 Keep suggested price language clear that it is current listing/negotiation guidance, not a future-sale forecast or closing guarantee.

## 3. Standalone Comparison UI

- [x] 3.1 Improve `/admin/promotions` standalone form help so model, year-model, condition, target margin, chart window, store purchase value, and current FIPE are self-explanatory.
- [x] 3.2 Improve the standalone result cards so selected condition, target margin, store purchase value, purchase ceiling, source quality, and result status are visible without requiring formula interpretation.
- [x] 3.3 Improve warning/success/partial-decision states so managers know what to change when the store purchase value exceeds the recommended ceiling or data is missing.
- [x] 3.4 Verify compact desktop and mobile layouts do not overflow, overlap, or hide important text.

## 4. Admin Form and Layout Standards

- [x] 4.1 Inventory the admin screen patterns touched or reused by this change: dashboard metrics, filters, forms, card grids, tables/lists, modals, charts, empty states, error states, and loading states.
- [x] 4.2 Improve form standards for labels, helper text, inputs, selects, money fields, grouped sections, primary/secondary actions, clear actions, disabled states, and inline guidance.
- [x] 4.3 Apply responsive layout rules for mobile, tablet, desktop, and wide desktop so admin patterns avoid horizontal overflow, overlapping text, clipped values, and hidden primary actions.
- [x] 4.4 Align repeated admin visual patterns such as metric cards, result cards, data rows, and filter panels with consistent spacing, density, border radius, and action placement.
- [x] 4.5 Document any admin route or screen pattern that still needs a separate future task instead of silently expanding this change beyond reviewable scope.

## 5. FIPE Analytics and Charts

- [x] 5.1 Improve the analytical FIPE section with business meaning for value retention, monthly variation, volatility, annual depreciation, and lifecycle status.
- [x] 5.2 Improve monthly FIPE and model-year charts with readable axes, selected/reference point emphasis, min/max callouts, legends, and explanatory copy.
- [x] 5.3 Preserve explicit single-reference and empty-chart states so the UI never draws a misleading trend.
- [x] 5.4 Verify missing FIPE periods remain visually marked as gaps and are not treated as forecasted prices.

## 6. Lima Automotiva Loading Modal

- [x] 6.1 Redesign the compare loading modal using Lima Automotiva branding, green progress treatment, vehicle/step icons, and FIPE -> Conservacao -> Margem -> Compra -> Preco process language.
- [x] 6.2 Provide responsive light/dark treatment with accessible contrast and no decorative overlap.
- [x] 6.3 Preserve sidebar-collapse behavior, minimum feedback duration, and slow-operation recovery message.

## 7. Validation

- [x] 7.1 Add or update focused tests for pricing helper behavior if condition/margin helper logic changes.
- [x] 7.2 Run `npm run lint`.
- [x] 7.3 Run `npm run typecheck`.
- [x] 7.4 Run `npm run test`.
- [x] 7.5 Run `npm run build`.
- [x] 7.6 Start the app and visually verify `/admin/promotions` on desktop and mobile, including form, cards, charts, and loading modal.
- [x] 7.7 Visually verify the relevant admin screen patterns at representative mobile, tablet, desktop, and wide desktop widths.
- [x] 7.8 Return Executor handoff with summary, changed files, validation results, risks, and reviewer notes.

## 8. Runtime Correction

- [x] 8.1 Keep `/admin/promotions` usable when the stock database is unreachable by showing an explicit stock-unavailable state while preserving the standalone comparison form and local development admin shell.
- [x] 8.2 Prevent standalone comparison field help text from being clipped by the admin panel and keep long tooltip copy readable.
- [x] 8.3 Rename the page/product language to "Precificador sem cadastro" and replace ambiguous "valor pretendido" wording with "valor de compra da loja" in form, loading, and decision output.
- [x] 8.4 Move the compare loading animation to a full-viewport overlay above the admin shell and make the FIPE -> conservacao -> margem -> compra -> preco process visible step by step.
- [x] 8.5 Tighten zoom/responsive behavior by moving field explanations inline, constraining charts to internal scroll regions, and clipping accidental body-level horizontal overflow.
- [x] 8.6 Remove stock-empty, stock-filter, and stock-diagnostic panels from the sem-cadastro pricing surface so the product remains focused on comparison before inventory registration.
- [x] 8.7 Rework standalone form spacing and action placement so helper text, money inputs, selects, and buttons remain aligned under zoom and compact desktop widths.
- [x] 8.8 Clarify that conservation is an internal commercial adjustment over FIPE and not a UF/state FIPE filter; FIPE by UF is not supported by the current FipeX provider.
- [x] 8.9 Strengthen the full-screen loading overlay with darker blur/focus treatment and container-bound step animation.
- [x] 8.10 Separate FIPE/conservation purchase ceiling from margin-raised listing price so over-ceiling purchases stay flagged even when the suggested announcement price increases to preserve margin.

## 9. Recommendation Engine and Report Modes

- [x] 9.1 Remove the stock-registered KPI block from `/admin/promotions` so the sem-cadastro product is not visually led by stock metrics.
- [x] 9.2 Add UF/market context to the standalone form and `/api/admin/price-insights` response while keeping the current FIPE/FipeX pricing scope explicitly national.
- [x] 9.3 Avoid fake UF pricing: mark regional FIPE pricing as not supported until a provider or local market rule actually returns regional values.
- [x] 9.4 Add Basic, Plus, and Advanced report modes so operators can choose between a low-noise recommendation, a managerial reading, and a technical funnel/chart view.
- [x] 9.5 Add an advanced recommendation funnel that explains reference, conservation, purchase ceiling, store purchase value, and listing price with compact card typography and distinct tones.
- [x] 9.6 Keep Plus/Advanced visualizations responsive and secondary to the main decision so zoomed desktop and compact screens avoid horizontal overflow.

## 10. Regional Liquidity Intelligence

- [x] 10.1 Add a separate market-liquidity helper that estimates UF liquidity, purchase attractiveness, resale likelihood, and source transparency without changing national FIPE values.
- [x] 10.2 Return `marketLiquidity` from `/api/admin/price-insights` as an additive contract while preserving `fipeEstimate`, `decision`, and `guidance` semantics.
- [x] 10.3 Reframe the main sem-cadastro result around "melhor preco para comprar" before the listing price, using the store purchase value as the operator's real desembolso.
- [x] 10.4 Improve the form purchase-value help and inline purchase hint so the operator sees "comprar ate", technical ceiling, liquidity score, and relative resale likelihood before generating the recommendation.
- [x] 10.5 Add a liquidity panel and Advanced sensitivity chart for purchase price versus required listing price/margin.
- [x] 10.6 Document that RENAVAM/SENATRAN, FENABRAVE, and FIPE/FipeX are source families for calibration, but the implemented fallback remains transparent and does not claim official FIPE by UF.
- [x] 10.7 Add a clickable explanation for liquidity that exposes the formula, component weights, point contribution, and the distinction between market-liquidity score and national FIPE.
