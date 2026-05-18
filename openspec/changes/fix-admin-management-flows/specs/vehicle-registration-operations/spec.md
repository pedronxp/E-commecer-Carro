## ADDED Requirements

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
