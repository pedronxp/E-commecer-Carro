# commercial-operations Specification

## Purpose
TBD - created by archiving change admin-commercial-operations-foundation. Update Purpose after archive.
## Requirements
### Requirement: Public conversion uses commercial events
The system SHALL record measurable public commercial actions as first-party commercial events instead of relying on cart or favorite activity as the primary buying signal.

#### Scenario: Vehicle detail WhatsApp click is recorded
- **WHEN** a visitor clicks the primary WhatsApp CTA on a vehicle detail page
- **THEN** the system records a commercial event with type `WHATSAPP_CLICK`, the related vehicle, source path, and timestamp before opening WhatsApp

#### Scenario: Vehicle detail view is recorded
- **WHEN** a visitor opens a vehicle detail page
- **THEN** the system records or schedules a commercial event with type `VEHICLE_VIEW`, related vehicle, source path, and timestamp

#### Scenario: Public cart is not the buying path
- **WHEN** a visitor views a vehicle detail page
- **THEN** the primary buying action SHALL be WhatsApp contact, not add-to-cart checkout

### Requirement: Sales leads represent customer intent
The system SHALL capture customer commercial intent as sales leads with normalized source, channel, status, and optional vehicle context.

#### Scenario: Visitor requests sale or consignment
- **WHEN** a visitor submits the sell/consignment form
- **THEN** the system creates a sales lead with intent, source page, preferred channel when provided, status `NEW`, and LGPD consent data

#### Scenario: Visitor requests financing
- **WHEN** a visitor submits or triggers a financing interest action
- **THEN** the system creates or records a commercial lead/event with intent `FINANCING_INTEREST`, source path, and related vehicle when available

#### Scenario: Visitor starts purchase by WhatsApp
- **WHEN** a visitor clicks "buy" or "talk on WhatsApp" for a vehicle
- **THEN** the system records the related vehicle and source path so the admin dashboard can attribute the contact to that vehicle

### Requirement: Admin access is internal-only
The system SHALL treat login and user management as internal operator access, not public customer account management.

#### Scenario: Public registration route is accessed
- **WHEN** a visitor opens or posts to public registration
- **THEN** the system does not create a public customer account and directs the visitor to the appropriate public contact or login behavior

#### Scenario: Admin manages access
- **WHEN** an admin opens the access management page
- **THEN** the UI uses internal operator language and allows authorized management of operator/admin accounts

#### Scenario: Internal operator opens operational admin routes
- **WHEN** an authenticated internal operator opens operational admin routes such as `/admin`, `/admin/cars-new`, `/admin/sell-leads`, or `/admin/promotions`
- **THEN** the system allows access to operational tools without exposing access-management actions

#### Scenario: Operator attempts access management
- **WHEN** an authenticated operator without admin role attempts to access `/admin/users` or submit access-management actions
- **THEN** the system denies the sensitive access-management operation

### Requirement: Dashboard provides operational filters
The admin dashboard SHALL provide period and operational filters for commercial events, leads, channel, source, and lead status.

#### Scenario: Admin filters dashboard by period
- **WHEN** an admin selects a dashboard period such as 7 days, 30 days, or month-to-date
- **THEN** the dashboard metrics update to use only events and leads from that period

#### Scenario: Admin filters by channel
- **WHEN** an admin filters by channel such as WhatsApp, phone, email, or in-person
- **THEN** the dashboard shows lead and event metrics matching that channel

#### Scenario: Admin filters by lead status
- **WHEN** an admin filters by lead status
- **THEN** the dashboard shows counts, lists, and conversion indicators for leads matching that status

### Requirement: Dashboard shows actionable commercial metrics
The admin dashboard SHALL show metrics that support daily dealership operation, including leads, WhatsApp conversion, vehicle performance, and FIPE/stock attention.

#### Scenario: Admin opens dashboard
- **WHEN** an admin opens `/admin`
- **THEN** the dashboard shows open leads, new leads, WhatsApp clicks, vehicle views, view-to-WhatsApp conversion, financing interest, sell/consignment interest, and vehicles needing pricing attention

#### Scenario: Vehicle has high views and low WhatsApp clicks
- **WHEN** a vehicle has many views but few WhatsApp clicks in the selected period
- **THEN** the dashboard highlights it as a vehicle that may need pricing, copy, photo, or availability review

#### Scenario: Leads require follow-up
- **WHEN** leads have active status and next action dates
- **THEN** the dashboard surfaces pending and overdue follow-ups for operators

