# fipe-pricing-workflow Specification

## Purpose
TBD - created by archiving change admin-commercial-operations-foundation. Update Purpose after archive.
## Requirements
### Requirement: FIPE lookup exposes source and confidence
The system SHALL display FIPE or pricing estimates with provider source, reference period, confidence, and fallback state.

#### Scenario: Provider returns a match
- **WHEN** the FIPE provider returns a vehicle estimate
- **THEN** the UI displays the provider name, matched title, reference month, estimated value, and confidence level

#### Scenario: Provider has no reliable match
- **WHEN** the FIPE provider cannot return a reliable match
- **THEN** the UI displays a manual fallback state and allows the operator to enter the reference value manually

#### Scenario: Vehicle type has no FIPE coverage
- **WHEN** the selected vehicle type has no reliable FIPE coverage in the current workflow
- **THEN** the system does not call unsupported provider behavior and clearly marks pricing as manual

### Requirement: Pricing comparison uses explicit parameters
The system SHALL calculate pricing suggestions from explicit parameters including vehicle type, year, title/model, condition, target margin, purchase cost, sale price, and FIPE reference when available.

#### Scenario: Operator changes condition
- **WHEN** an operator selects a vehicle condition for comparison
- **THEN** the system recalculates adjusted FIPE and suggested price based on the selected condition factor

#### Scenario: Operator changes target margin
- **WHEN** an operator changes the target margin
- **THEN** the system recalculates suggested sale price and gross margin using the selected target margin

#### Scenario: Purchase cost is missing
- **WHEN** purchase cost is not provided
- **THEN** the system still shows FIPE and sale price information but marks margin as unavailable

### Requirement: FIPE comparison supports standalone and registered vehicles
The system SHALL support both comparing a vehicle before registration and reviewing pricing for vehicles already in stock.

#### Scenario: Operator compares before creating vehicle
- **WHEN** an operator enters model, year, vehicle type, and optional cost without selecting a registered vehicle
- **THEN** the system returns a standalone comparison that can guide registration

#### Scenario: Operator reviews registered stock
- **WHEN** an operator opens the FIPE comparison page
- **THEN** the system lists registered vehicles with current price, FIPE reference, purchase cost, suggested price, margin, and risk state

#### Scenario: Vehicle has negative or risky margin
- **WHEN** calculated margin is below zero or below an accepted threshold
- **THEN** the UI highlights the vehicle as a pricing risk

### Requirement: FIPE workflow integrates with vehicle registration
The system SHALL allow FIPE lookup and pricing comparison data to support the vehicle creation flow without making provider data mandatory.

#### Scenario: Operator selects a FIPE suggestion during vehicle creation
- **WHEN** an operator selects a provider suggestion in the vehicle creation form
- **THEN** the system fills compatible fields such as title, year, brand, reference price, fuel, and description where safe

#### Scenario: Operator overrides provider value
- **WHEN** an operator edits the FIPE or sale price after an automatic suggestion
- **THEN** the manually edited value is preserved and not overwritten by later automatic suggestions

#### Scenario: Provider lookup fails during vehicle creation
- **WHEN** the provider request fails or returns no match
- **THEN** the form remains usable and the operator can complete registration with manual values

