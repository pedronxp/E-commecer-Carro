## MODIFIED Requirements

### Requirement: FIPE lookup exposes source and confidence
The system SHALL display FIPE or pricing estimates with provider source, reference period, confidence, reference quality, and fallback state in language suitable for commercial decision-making.

#### Scenario: Provider returns a match
- **WHEN** the FIPE provider returns a vehicle estimate
- **THEN** the UI displays the provider name, matched title, reference month, estimated value, confidence level, and a plain-language reference quality explanation

#### Scenario: Provider has no reliable match
- **WHEN** the FIPE provider cannot return a reliable match
- **THEN** the UI displays a manual fallback state and allows the operator to enter the reference value manually
- **AND** the UI explains that quality is limited because there is no reliable automatic provider reference

#### Scenario: Vehicle type has no FIPE coverage
- **WHEN** the selected vehicle type has no reliable FIPE coverage in the current workflow
- **THEN** the system does not call unsupported provider behavior and clearly marks pricing as manual

#### Scenario: Operator reviews reference quality
- **WHEN** a FIPE/FipeX reference is used in `/admin/promotions`
- **THEN** the page explains whether the reference is exact, approximate, or manual/fallback
- **AND** the page shows which matched brand, model, fuel, year, and reference month support that quality label when available

### Requirement: Pricing comparison uses explicit parameters
The system SHALL calculate pricing suggestions from explicit parameters including vehicle type, year, title/model, condition, target margin, purchase cost, sale price, and FIPE reference when available.

#### Scenario: Operator changes condition
- **WHEN** an operator selects a vehicle condition for comparison
- **THEN** the system recalculates adjusted FIPE and suggested price based on the selected condition factor
- **AND** the UI explains the selected condition factor as a commercial adjustment to the FIPE reference
- **AND** the UI explains that this is a vehicle-conservation adjustment and not a FIPE by UF/state filter

#### Scenario: Operator asks for FIPE by UF/state
- **WHEN** an operator reviews the pricing reference source for the sem-cadastro flow
- **THEN** the UI explains that the current FipeX provider flow returns national FIPE/FipeX references and does not support UF/state filtering
- **AND** any regional market reading is treated as a separate future source or local commercial rule, not as official FIPE by state

#### Scenario: Operator sends UF market context to the pricing API
- **WHEN** an authenticated internal consumer calls `/api/admin/price-insights` with `marketUf` or `compareMarketUf`
- **THEN** the response includes `marketContext`, selected UF, national pricing scope, regional pricing availability, regional provider status, and explanatory note
- **AND** the current provider call is not modified to pass unsupported UF filters
- **AND** no FIPE value, purchase ceiling, or suggested price is adjusted as if regional FIPE pricing existed

#### Scenario: Pricing API returns market-liquidity intelligence
- **WHEN** an authenticated internal consumer calls `/api/admin/price-insights` with FIPE, purchase, margin, UF, or comparable-market inputs
- **THEN** the response includes an additive `marketLiquidity` object with liquidity score, confidence, best purchase price, competitive purchase price, max risk purchase price, resale likelihood, listing range, drivers, and source notes
- **AND** the `marketLiquidity` object includes calculation metadata with formula, component weights, component scores, point contribution, and a note explaining the proxy nature of the score
- **AND** `marketLiquidity` does not overwrite or mutate `fipeEstimate`, `decision.suggestedPrice`, `decision.maxRecommendedPurchasePrice`, or provider source semantics
- **AND** the API response names public source families used for calibration planning, including RENAVAM/SENATRAN fleet data, FENABRAVE market indicators, and national FIPE/FipeX reference data
- **AND** if calibrated external regional data is unavailable, the response clearly treats liquidity as a transparent fallback/proxy rather than official regional FIPE

#### Scenario: Operator changes target margin
- **WHEN** an operator changes the target margin
- **THEN** the system recalculates suggested sale price, gross margin, margin percent, and maximum recommended purchase value using the selected target margin
- **AND** the UI explains how the margin affects the purchase ceiling and why a value above that ceiling may make the negotiation unattractive
- **AND** the system separates the FIPE/conservation purchase ceiling from the margin-based minimum listing price needed when the purchase cost is above that ceiling

#### Scenario: Purchase cost is missing
- **WHEN** purchase cost is not provided
- **THEN** the system still shows FIPE and sale price information but marks margin as unavailable
- **AND** the UI explains which margin and purchase-ceiling cards depend on the missing cost input

#### Scenario: Operator selects recommendation report mode
- **WHEN** an operator requests Basic, Plus, or Advanced report mode
- **THEN** the pricing API normalizes the mode and returns it with the decision package
- **AND** the UI uses the mode to decide how much explanation to render without changing the underlying price calculation
- **AND** Basic keeps the decision focused, Plus adds managerial FIPE/source context, and Advanced adds formula, funnel, analytics, and technical chart explanation

## ADDED Requirements

### Requirement: FIPE analytical reading is self-explanatory
The system SHALL present FIPE analytical data as a manager-readable interpretation, not only raw provider metrics.

#### Scenario: Operator reviews analytical FIPE cards
- **WHEN** provider analytics are available for the selected FIPE reference
- **THEN** the page shows each metric with a short business meaning, including value retention, monthly variation, volatility, annual depreciation, and lifecycle status
- **AND** the section explains how those metrics affect negotiation confidence without replacing official FIPE validation

#### Scenario: Operator reviews FIPE spread
- **WHEN** the page shows a difference between lower and higher FIPE values
- **THEN** the label and detail explain that the value is the spread between the minimum and maximum references in the selected window
- **AND** the UI explains whether the spread is small enough for a stable reference or large enough to require extra caution

#### Scenario: Operator reviews FIPE trend
- **WHEN** the page shows a FIPE trend
- **THEN** the trend label explains whether the filtered FIPE series is rising, falling, or stable
- **AND** the detail explains that the trend is historical provider data for the selected reference window, not a future sale forecast

#### Scenario: Operator reviews FIPE charts
- **WHEN** a FIPE chart is rendered on `/admin/promotions`
- **THEN** the chart includes readable axes, selected/reference point emphasis, min/max callouts, missing-data treatment, and explanatory copy below the chart
- **AND** if the provider returns only one usable reference, the page shows a non-line visual state that avoids implying a trend
