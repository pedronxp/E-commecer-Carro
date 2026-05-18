# vehicle-registration-operations Specification

## Purpose
TBD - created by archiving change admin-commercial-operations-foundation. Update Purpose after archive.
## Requirements
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

### Requirement: Vehicle creation presents a managerial workflow
The vehicle creation page SHALL present a professional operational workflow with clear sections, concise operator copy, and actionable feedback for inventory registration.

#### Scenario: Operator opens vehicle creation
- **WHEN** an internal operator opens `/admin/cars-new`
- **THEN** the page groups public listing data, pricing/FIPE data, taxonomy selection, media, and internal controls into visually distinct sections with consistent spacing

#### Scenario: Operator reads page guidance
- **WHEN** an internal operator reviews helper copy or empty states on `/admin/cars-new`
- **THEN** the text explains concrete operator decisions and does not show non-actionable or promotional messages that do not help registration

#### Scenario: Operator submits incomplete vehicle
- **WHEN** an internal operator submits the vehicle form with missing or invalid required fields
- **THEN** the system blocks creation and shows clear validation feedback near the relevant field or section

### Requirement: Vehicle creation integrates taxonomy entry safely
The vehicle creation flow SHALL let operators select or create required taxonomy values without creating duplicates or losing form context.

#### Scenario: Operator selects existing taxonomy values
- **WHEN** an internal operator selects an existing brand and category
- **THEN** the form stores the selected identifiers and submits them with the vehicle creation request

#### Scenario: Operator creates taxonomy from the vehicle form
- **WHEN** an internal operator creates a brand or category from `/admin/cars-new`
- **THEN** the system validates the name, creates or reuses the matching item, selects it in the form, and keeps the rest of the vehicle form state intact

#### Scenario: Taxonomy API creation fails
- **WHEN** taxonomy creation from `/admin/cars-new` fails because of duplicate, validation, auth, or server error
- **THEN** the form shows a specific actionable message and lets the operator continue editing without clearing entered vehicle data

### Requirement: Vehicle creation validates operational parameters consistently
The vehicle creation flow SHALL normalize and validate typed parameters before persistence, including money, year, mileage, vehicle type, condition, pricing references, and optional internal flags.

#### Scenario: Operator submits valid vehicle parameters
- **WHEN** an internal operator submits valid title, description, price, year, brand, category, vehicle type, condition, and optional fields
- **THEN** the system creates the vehicle, records images and features when provided, revalidates admin/catalog routes, and redirects to the admin stock view

#### Scenario: Operator submits invalid money or numeric values
- **WHEN** an internal operator submits invalid price, purchase cost, FIPE reference, year, mileage, doors, or capacity values
- **THEN** the system rejects the submission with a clear message and does not persist a partial vehicle

#### Scenario: Operator uses manual pricing for electric bike
- **WHEN** an internal operator selects electric bike as the vehicle type
- **THEN** the system treats FIPE as a manual reference, avoids unsupported automatic FIPE calls, and hides vehicle fields that do not apply

#### Scenario: API-assisted pricing is unavailable
- **WHEN** FIPE suggestion or price insight requests fail during vehicle creation
- **THEN** the form remains usable and allows manual completion with visible fallback feedback

