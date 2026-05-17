## ADDED Requirements

### Requirement: Vehicle creation separates public and internal fields
The vehicle creation flow SHALL distinguish public listing data from internal commercial and pricing data.

#### Scenario: Operator fills public listing fields
- **WHEN** an operator enters title, description, year, mileage, images, brand, category, fuel, transmission, and location
- **THEN** the system treats those fields as public listing data that can appear in the catalog

#### Scenario: Operator fills internal commercial fields
- **WHEN** an operator enters purchase cost, FIPE reference, margin notes, promotion notes, or operational status
- **THEN** the system treats those fields as internal or controlled commercial data and does not expose internal-only fields on the public listing

#### Scenario: Required public fields are missing
- **WHEN** an operator submits a vehicle without required public fields
- **THEN** the system blocks creation and shows a clear validation message

### Requirement: Vehicle form adapts to vehicle type
The vehicle creation flow SHALL adapt labels, helper text, fields, and pricing behavior to the selected vehicle type.

#### Scenario: Operator selects car
- **WHEN** the operator selects vehicle type `CAR`
- **THEN** the form shows car-oriented labels, FIPE lookup support, door/capacity fields, and car feature options

#### Scenario: Operator selects motorcycle
- **WHEN** the operator selects vehicle type `MOTORCYCLE`
- **THEN** the form shows motorcycle-oriented labels, FIPE lookup support, and motorcycle feature options

#### Scenario: Operator selects electric bike
- **WHEN** the operator selects vehicle type `ELECTRIC_BIKE`
- **THEN** the form marks FIPE as manual and hides fields that do not apply, such as doors

### Requirement: Vehicle creation supports operator guidance
The vehicle creation flow SHALL provide labels and helper text that explain what each operator input is responsible for.

#### Scenario: Operator reads price fields
- **WHEN** the operator views price, purchase cost, and FIPE fields
- **THEN** the form explains which values are public, which values are internal, and how each affects margin or negotiation

#### Scenario: Operator reads brand and category fields
- **WHEN** the operator selects or creates a brand or category
- **THEN** the form prevents duplicate creation where possible and explains whether the value already exists

#### Scenario: Operator reads media fields
- **WHEN** the operator adds vehicle images
- **THEN** the form explains that these images represent the actual vehicle listing and should not be generic generated banners

### Requirement: Vehicle creation remains valid without automatic integrations
The vehicle creation flow SHALL remain functional when FIPE lookup, suggestions, or browser helpers are unavailable.

#### Scenario: FIPE suggestion API fails
- **WHEN** the FIPE suggestion API fails during title entry
- **THEN** the operator can continue entering vehicle details manually

#### Scenario: Price insight API fails
- **WHEN** the price insight API fails during vehicle entry
- **THEN** the operator can still submit a valid vehicle with manual price and FIPE reference values

#### Scenario: Local image preview is unavailable
- **WHEN** local image preview fails
- **THEN** the operator receives a clear message and can continue with other fields or retry media entry
