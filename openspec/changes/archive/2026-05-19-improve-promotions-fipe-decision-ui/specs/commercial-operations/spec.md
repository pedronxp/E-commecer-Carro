## MODIFIED Requirements

### Requirement: Price comparison supports standalone vehicle decisions
The admin pricing workflow SHALL allow an internal operator to compare a vehicle without first creating a stock record and SHALL return a complete, self-explanatory decision package when enough pricing inputs are available.

#### Scenario: Operator compares a vehicle without stock registration
- **WHEN** an internal operator opens `/admin/promotions` as the Precificador sem cadastro and informs model, year, type, store purchase value, optional current price, condition, and target margin
- **THEN** the page estimates FIPE when available and shows suggested sale price, gross margin, margin percent, source, and matched reference without requiring another stock vehicle
- **AND** the form shows a branded Lima Automotiva loading animation after the operator clicks Gerar recomendacao while the route is being updated
- **AND** the loading animation covers the full viewport above sidebar/topbar chrome with responsive treatment, clear FIPE/conservation/margin/store-purchase/recommendation progress steps, and enough contrast for the admin theme
- **AND** the loading animation collapses the admin sidebar while the comparison runs
- **AND** after a comparison result exists, the standalone comparison fields can be collapsed behind an edit dropdown
- **AND** the result explains that suggested price uses the highest available value among adjusted FIPE, margin target minimum, and current informed price
- **AND** the result makes clear that suggested price is a current commercial listing/negotiation reference, not a future-sale forecast
- **AND** the result explains that gross margin is suggested price minus store purchase value and margin percent is gross margin divided by suggested price
- **AND** the result includes improvement guidance for incomplete, risky, or consistent pricing decisions

#### Scenario: Operator fills standalone comparison inputs
- **WHEN** an internal operator uses the standalone comparison form
- **THEN** condition and target margin are visible in the same form and the page explains that store purchase value is the amount the store paid or wants to pay for the vehicle before stock registration while current FIPE price is the model-year reference filled from the selected suggestion
- **AND** the year field is presented as vehicle model year rather than research, listing, or calendar history date
- **AND** each relevant field shows nearby contextual help that remains readable under browser zoom and does not depend on clipped tooltips
- **AND** the acquisition value input is presented as the value the store paid or wants to pay for the vehicle
- **AND** the acquisition value help explains that the value should represent the total store outlay, including seller proposal, expected preparation, fees, documentation, and costs before listing
- **AND** the target margin input explains that the margin determines the minimum acceptable commercial result and the maximum recommended purchase value
- **AND** every vehicle condition option explains the commercial adjustment it applies to FIPE before the operator compares
- **AND** the page explains that vehicle conservation is an internal commercial adjustment over the FIPE/FipeX reference, not a FIPE filter by UF/state
- **AND** the page explains that the current FipeX provider flow returns a national FIPE/FipeX reference and does not support UF/state FIPE filtering

#### Scenario: Operator selects a suggested standalone model
- **WHEN** an internal operator selects a FIPE/FipeX model suggestion in the standalone comparison form
- **THEN** the form fills the model, year, and current price reference for the selected vehicle and formats monetary fields in BRL

#### Scenario: Operator uses the sem-cadastro surface without stock panels
- **WHEN** an internal operator opens `/admin/promotions` as the Precificador sem cadastro
- **THEN** the page prioritizes the standalone comparison form, result cards, FIPE reading, and loading flow
- **AND** the page does not show stock-empty prompts, stock filter panels, or stock diagnostic panels that tell the operator to register inventory before using the sem-cadastro product
- **AND** the page does not show a stock-registered KPI block above or beside the sem-cadastro recommendation

#### Scenario: Operator clears pricing inputs
- **WHEN** an internal operator opens `/admin/promotions` without query parameters or clicks a clear action
- **THEN** the visible filter and standalone fields return to empty placeholder state while backend calculations continue using safe defaults

#### Scenario: Operator opens the page without inventory
- **WHEN** there are no vehicles in stock
- **THEN** the standalone sem-cadastro comparison remains available without showing a "Nenhum veículo cadastrado" empty panel

#### Scenario: Operator reviews standalone decision cards
- **WHEN** the standalone comparison returns a decision package
- **THEN** the first decision message prioritizes the best purchase price for the store before the listing recommendation
- **AND** the primary cards use manager-readable labels and detail text for current FIPE, suggested listing price, gross margin, FIPE spread, FIPE trend, liquidity, resale likelihood, and reference quality
- **AND** the selected condition, target margin, store purchase value, maximum recommended purchase value, and result status are visible without requiring the operator to infer them from the formula block
- **AND** ambiguous terms such as lower/higher difference, trend, and reference quality are explained as commercial decision signals
- **AND** warning states explicitly tell whether the store purchase value exceeds the recommended ceiling or whether more data is needed
- **AND** when store purchase value exceeds the FIPE/conservation purchase ceiling, the warning remains visible even if the listing price recommendation increases to preserve the selected margin

#### Scenario: Operator chooses recommendation report depth
- **WHEN** an internal operator selects Basic, Plus, or Advanced in the standalone comparison form
- **THEN** Basic shows a low-noise decision focused on suggested price, purchase ceiling, margin, conservation, and source
- **AND** Plus adds managerial source quality, FIPE trend/spread, and the primary FIPE chart when enough data exists
- **AND** Advanced adds a technical recommendation funnel, formula explanation, FIPE analytics, and chart context explaining why the recommendation was produced
- **AND** report cards use compact typography and distinct tones without causing horizontal overflow at zoomed or compact desktop widths

#### Scenario: Operator reviews market liquidity
- **WHEN** the standalone comparison has enough FIPE, purchase, or market context to build a liquidity read
- **THEN** the page shows a separate liquidity panel with best purchase price, competitive purchase range, listing range for giro, liquidity score, relative resale likelihood, and confidence
- **AND** the panel states that liquidity is a commercial market signal and does not alter the national FIPE reference
- **AND** the panel explains the major drivers: UF/market profile, purchase value against best price, listing price against FIPE, FIPE trend/spread, and available local samples
- **AND** the panel includes a clickable explanation that shows the formula, component weights, point contribution, and why the result approximates market reality without becoming official FIPE by UF
- **AND** Advanced mode includes a sensitivity chart showing how purchase price changes affect required listing price to preserve the target margin

#### Scenario: Operator selects UF market context
- **WHEN** an internal operator selects a UF in the standalone comparison form
- **THEN** the result records the UF as market context for the store and shows it in the decision context
- **AND** the UI states that the current FIPE/FipeX pricing engine still uses national FIPE references and does not return regional FIPE prices by UF
- **AND** the UI does not alter FIPE value, purchase ceiling, or suggested listing price as if a regional provider existed
- **AND** the UI may use UF as one driver of liquidity and resale confidence when the output is explicitly labeled as market-liquidity intelligence rather than FIPE regional

#### Scenario: Operator reviews standalone price history
- **WHEN** the standalone comparison has enough FIPE/FipeX model-year values or monthly FIPE history
- **THEN** the result shows a line chart that identifies period, minimum, maximum, selected reference, spread, and trend in language suitable for operators and managers
- **AND** the operator can choose automatic FIPE-found years, a window ending at the informed model year, a visual axis from the model year through the current year, or the configured monthly history window when monthly history is available
- **AND** the chart separates the FIPE reference period from the visual axis period so the UI does not imply projected prices
- **AND** when the period expands to the current year, the axis spans from the selected model year to the current year while missing FIPE years remain unpriced
- **AND** the chart visually marks unpriced intervals before the first available FIPE reference and after the last available FIPE reference
- **AND** the chart preserves readable spacing, legends, annotations, and labels instead of compressing the full line or leaving the graph visually dry

#### Scenario: System treats internal cookies consistently
- **WHEN** an operator logs in, logs out, or an authenticated API rejects an invalid session
- **THEN** session cookies use one shared policy for httpOnly, sameSite, path, max age, expiration, and secure behavior
- **AND** local HTTP development remains usable while HTTPS deployments use secure cookies
- **AND** optional consent cookies keep SameSite and Secure attributes aligned with the current protocol

#### Scenario: Operator reviews remaining stock indicators
- **WHEN** an internal operator opens `/admin/promotions`
- **THEN** any remaining stock indicator is secondary to the sem-cadastro product and does not render stock filters, stock diagnostics, or stock-empty registration prompts

#### Scenario: Operator reviews a stock vehicle row
- **WHEN** the stock comparison list shows a vehicle
- **THEN** the row identifies whether the item is within margin target, below target, missing cost, missing FIPE, or has positive adjustment opportunity

#### Scenario: Operator starts typing a vehicle model
- **WHEN** an internal operator types at least two characters in the standalone comparison model field
- **THEN** the field offers matching FIPE/FipeX vehicle model suggestions across available years and fills model/year when the operator selects a suggestion

#### Scenario: Operator opens pricing guidance
- **WHEN** an internal operator opens the pricing guide on `/admin/promotions`
- **THEN** the system shows a modal with step-by-step guidance and a visual SVG demonstration of FIPE selection, conservation adjustment, store purchase/margin inputs, decision reading, and chart/source interpretation

#### Scenario: Operator reviews sell lead data handling
- **WHEN** an internal operator opens `/admin/sell-leads`
- **THEN** the page explains which information comes automatically from public site/API submissions, which fields require manual operator treatment, and which missing follow-up/channel/contact points need resolution

#### Scenario: Operator reviews the admin dashboard
- **WHEN** an internal operator opens `/admin`
- **THEN** the dashboard uses operational labels, includes a visible Comparativo FIPE metric/action, and explains stock pricing priorities without generic wording

#### Scenario: Internal pricing API returns a decision package
- **WHEN** an authenticated internal consumer calls `/api/admin/price-insights` with vehicle text, year, type, condition, target margin, purchase cost, and optional current price
- **THEN** the response includes FIPE/reference data plus a `decision` object with adjusted FIPE, suggested price, gross margin, margin percent, discount percent, and the basis used for the recommendation
- **AND** the response includes a `guidance` object with severity, explanation, and actionable suggestions
- **AND** the response includes selected report mode and UF/market context with explicit regional-pricing availability status
- **AND** local fallback matches are restricted by useful title tokens, vehicle type, and a bounded model-year window before contributing price data
- **AND** if only one FIPE year exists for the selected model-year, the page shows an explicit non-chart SVG state instead of drawing a misleading line
- **AND** if the comparison loading state remains active for an unusual duration, the modal explains that the operation may be stalled and instructs the operator to refresh the page

## ADDED Requirements

### Requirement: Admin screens use consistent form and layout patterns
The admin area SHALL use predictable form, layout, and responsive patterns across operational screens so operators can move between dashboard, vehicle, lead, taxonomy, user, and pricing workflows without relearning the interface.

#### Scenario: Operator reviews admin form patterns
- **WHEN** an internal operator opens an admin form or filter group
- **THEN** labels, helper text, input/select sizing, currency fields, grouped sections, primary actions, secondary actions, clear actions, and disabled states follow a consistent visual and interaction pattern
- **AND** required context is visible near the field instead of depending only on hidden or distant instructions
- **AND** long labels, helper text, and values wrap or truncate intentionally without breaking the form grid

#### Scenario: Operator reviews admin screen layouts
- **WHEN** an internal operator opens dashboard, list/table, card grid, form, modal, chart, empty state, or loading state screens in the admin area
- **THEN** each screen uses stable spacing, section hierarchy, readable headings, and action placement appropriate to that pattern
- **AND** page sections do not appear as unrelated visual fragments or nested card stacks
- **AND** repeated patterns such as metric cards, filters, result cards, and data rows use consistent dimensions and density

#### Scenario: Operator uses admin screens responsively
- **WHEN** an internal operator uses admin screens on mobile, tablet, desktop, or wide desktop viewports
- **THEN** navigation, forms, filters, cards, charts, tables/lists, dialogs, and loading overlays remain readable and usable without horizontal overflow, text overlap, hidden primary actions, or clipped values
- **AND** dense data patterns convert to stacked cards or scrollable regions only when that treatment preserves labels and actions
- **AND** charts keep legends, axes, and callouts readable without implying missing data or forecasted prices

#### Scenario: Operator encounters empty, loading, or error states
- **WHEN** an admin screen has no data, is loading, or cannot complete an action
- **THEN** the state uses the same layout standards as the rest of the admin area and explains the next practical action
- **AND** loading states preserve context about what is being processed rather than showing only a generic spinner

#### Scenario: Operator opens pricing page while stock database is unavailable
- **WHEN** an internal operator opens `/admin/promotions` and the stock vehicle query cannot reach the database
- **THEN** the page still renders the standalone comparison form instead of crashing
- **AND** the page shows only a compact stock-unavailable notice without reintroducing stock KPIs, stock filters, or stock diagnostics
- **AND** the unavailable state explains that FIPE, margin, and store-purchase comparison can continue while the stock connection recovers
- **AND** in local development, an already signed internal session can still render the admin shell while the database user lookup is temporarily unavailable
