## ADDED Requirements

### Requirement: Admin manages catalog taxonomies from one adaptive route
The system SHALL provide a single adaptive admin management surface for catalog taxonomies while preserving the business distinction between brands/fabricantes and categories/segmentos.

#### Scenario: Operator opens brand taxonomy management
- **WHEN** an internal operator opens the taxonomy route for brands/fabricantes
- **THEN** the page shows brand-specific title, helper copy, iconography, linked vehicle counts, create action, duplicate prevention, and safe delete behavior for unused brands

#### Scenario: Operator opens category taxonomy management
- **WHEN** an internal operator opens the taxonomy route for categories/segmentos
- **THEN** the page shows category-specific title, helper copy, iconography, linked vehicle counts, create action, optional suggested categories, duplicate prevention, and safe delete behavior for unused categories

#### Scenario: Operator uses old taxonomy links
- **WHEN** an operator navigates to a previous taxonomy URL such as `/admin/brands` or `/admin/categories`
- **THEN** the system routes the operator to the corresponding adaptive taxonomy experience or provides an equivalent compatibility page without losing functionality

### Requirement: Taxonomy mutations use consistent validation and responses
The system SHALL validate taxonomy create/update/delete operations consistently and return predictable status codes and error payloads.

#### Scenario: Operator creates a valid taxonomy item
- **WHEN** an internal operator submits a valid brand or category name
- **THEN** the system creates the item with a normalized slug and returns the created item using the agreed API response contract

#### Scenario: Operator submits a duplicate taxonomy item
- **WHEN** an internal operator submits a brand or category name that already exists after normalization
- **THEN** the system rejects the mutation with HTTP 409 and a structured duplicate error message

#### Scenario: Operator deletes an item in use
- **WHEN** an internal operator attempts to delete a brand or category linked to one or more vehicles
- **THEN** the system blocks deletion and returns or displays a clear explanation that the item is in use

#### Scenario: Unauthenticated user mutates taxonomy
- **WHEN** a user without internal access calls a taxonomy mutation endpoint
- **THEN** the system denies the request with the appropriate 401 or 403 response
