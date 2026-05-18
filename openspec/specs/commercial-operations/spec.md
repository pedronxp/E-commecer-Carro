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

### Requirement: Admin shell supports operational navigation
The admin area SHALL present a stable operational shell with store branding, consistent menu sizing, clear spacing, and reliable responsive navigation.

#### Scenario: Operator opens admin on desktop
- **WHEN** an internal operator opens any `/admin` route on a desktop viewport
- **THEN** the sidebar shows the store logo or approved brand mark on the left, readable navigation labels, stable width, clear active state, and content spacing that does not collide with the header or page body

#### Scenario: Operator collapses admin menu
- **WHEN** an internal operator collapses the admin menu
- **THEN** the shell keeps recognizable branding, icon-only navigation with accessible labels, and a content offset matching the collapsed width

#### Scenario: Operator opens admin on mobile
- **WHEN** an internal operator opens admin on a mobile viewport
- **THEN** the menu opens and closes without obscuring actionable content after navigation

#### Scenario: Operator clicks outside the admin sidebar
- **WHEN** an internal operator clicks the admin content area outside the sidebar
- **THEN** the system closes the mobile menu or collapses the desktop sidebar so the operator can focus on the active form or table

### Requirement: Sales lead funnel supports operational treatment
The sales lead admin page SHALL organize leads as an operational funnel with actionable states, source/channel context, follow-up handling, and clear data-entry treatment.

#### Scenario: Operator reviews lead funnel
- **WHEN** an internal operator opens `/admin/sell-leads`
- **THEN** the page shows counts and lists grouped or filterable by intake, contacted, evaluating, follow-up due, closed, and archived states

#### Scenario: Operator updates lead treatment
- **WHEN** an internal operator changes lead status, contact channel, next action, or internal note
- **THEN** the system persists the treatment, appends note history without losing prior notes, refreshes dashboard data, and keeps the lead in the correct funnel state

#### Scenario: Operator filters lead intake
- **WHEN** an internal operator filters leads by status, source, channel, or period
- **THEN** the page shows only matching leads and updates metrics to match the same filter scope

#### Scenario: Operator handles personal data removal
- **WHEN** an internal operator archives a lead and removes personal data
- **THEN** the system anonymizes personal fields, records an internal note, marks the lead archived, and excludes it from active funnel counts

### Requirement: Commercial APIs use validated resource contracts
The system SHALL validate sales lead and commercial event submissions with explicit schemas, resource-oriented status codes, and structured errors that do not expose internal details.

#### Scenario: Public visitor submits valid sales lead
- **WHEN** a public visitor submits a valid sales lead payload with consent
- **THEN** the API creates the sales lead, records the related commercial event when applicable, and returns HTTP 201 with the created lead identifier

#### Scenario: Public visitor submits invalid sales lead
- **WHEN** a public visitor submits malformed or invalid lead data
- **THEN** the API rejects it with HTTP 400 or 422 and a structured validation error containing safe field details

#### Scenario: Public visitor records commercial event
- **WHEN** a public visitor triggers a valid commercial event such as WhatsApp click, financing interest, vehicle view, purchase intent, or contact intent
- **THEN** the API records the event with safe metadata and returns HTTP 201 with the event identifier

#### Scenario: API receives unsafe metadata
- **WHEN** commercial event metadata exceeds allowed keys, sizes, or safe value types
- **THEN** the API rejects the request with a structured validation error and does not store internal or unsafe payload data

### Requirement: Price comparison supports standalone vehicle decisions
The admin pricing workflow SHALL allow an internal operator to compare a vehicle without first creating a stock record and SHALL return a complete decision package when enough pricing inputs are available.

#### Scenario: Operator compares a vehicle without stock registration
- **WHEN** an internal operator opens `/admin/promotions` and informs model, year, type, purchase cost, optional current price, condition, and target margin
- **THEN** the page estimates FIPE when available and shows suggested sale price, gross margin, margin percent, source, and matched reference without requiring another stock vehicle
- **AND** the form shows a vehicle loading animation after the operator clicks Compare while the route is being updated
- **AND** the loading animation appears as a centered modal with blurred/moving backdrop and collapses the admin sidebar while the comparison runs
- **AND** after a comparison result exists, the standalone comparison fields can be collapsed behind an edit dropdown
- **AND** the result explains that suggested price uses the highest available value among adjusted FIPE, margin target minimum, and current informed price
- **AND** the result makes clear that suggested price is a current commercial listing/negotiation reference, not a future-sale forecast
- **AND** the result explains that gross margin is suggested price minus intended payment value and margin percent is gross margin divided by suggested price
- **AND** the result includes improvement guidance for incomplete, risky, or consistent pricing decisions

#### Scenario: Operator fills standalone comparison inputs
- **WHEN** an internal operator uses the standalone comparison form
- **THEN** condition and target margin are visible in the same form and the page explains that cost is the amount paid for the vehicle while current FIPE price is the model-year reference filled from the selected suggestion
- **AND** the year field is presented as vehicle model year rather than research, listing, or calendar history date
- **AND** each relevant field label offers a short contextual help tooltip
- **AND** the acquisition cost input is presented as the value the store intends to pay for the vehicle

#### Scenario: Operator selects a suggested standalone model
- **WHEN** an internal operator selects a FIPE/FipeX model suggestion in the standalone comparison form
- **THEN** the form fills the model, year, and current price reference for the selected vehicle and formats monetary fields in BRL

#### Scenario: Operator separates stock filters from standalone comparison
- **WHEN** an internal operator changes the pricing filters on `/admin/promotions`
- **THEN** the system recalculates only stock KPIs and stock rows until the operator explicitly clicks the standalone Compare action

#### Scenario: Operator clears pricing inputs
- **WHEN** an internal operator opens `/admin/promotions` without query parameters or clicks a clear action
- **THEN** the visible filter and standalone fields return to empty placeholder state while backend calculations continue using safe defaults

#### Scenario: Operator opens stock filters without inventory
- **WHEN** there are no vehicles in stock
- **THEN** the stock filter panel explains that stock filters are unavailable until the first vehicle is registered

#### Scenario: Operator reviews standalone price history
- **WHEN** the standalone comparison has enough FIPE/FipeX model-year values
- **THEN** the result shows a line chart comparing FIPE values by vehicle model year, identifies period, minimum, maximum, and amplitude KPIs, and highlights the selected model year
- **AND** the operator can choose automatic FIPE-found years, a window ending at the informed model year, or a visual axis from the model year through the current year
- **AND** the chart separates the FIPE reference period from the visual axis period so the UI does not imply projected prices
- **AND** when the period expands to the current year, the axis spans from the selected model year to the current year while missing FIPE years remain unpriced
- **AND** the chart visually marks unpriced intervals before the first available FIPE reference and after the last available FIPE reference
- **AND** the chart preserves readable spacing for available FIPE points instead of compressing the full line into one side when the visual axis extends to the current year

#### Scenario: System treats internal cookies consistently
- **WHEN** an operator logs in, logs out, or an authenticated API rejects an invalid session
- **THEN** session cookies use one shared policy for httpOnly, sameSite, path, max age, expiration, and secure behavior
- **AND** local HTTP development remains usable while HTTPS deployments use secure cookies
- **AND** optional consent cookies keep SameSite and Secure attributes aligned with the current protocol

#### Scenario: Operator reviews pricing diagnostics
- **WHEN** an internal operator opens `/admin/promotions`
- **THEN** the page shows stock-only managerial diagnostics such as filtered vehicle count, FIPE coverage, margin attention points, potential stock price adjustment, and the primary action needed for the current stock filter scope

#### Scenario: Operator reviews a stock vehicle row
- **WHEN** the stock comparison list shows a vehicle
- **THEN** the row identifies whether the item is within margin target, below target, missing cost, missing FIPE, or has positive adjustment opportunity

#### Scenario: Operator starts typing a vehicle model
- **WHEN** an internal operator types at least two characters in the standalone comparison model field
- **THEN** the field offers matching FIPE/FipeX vehicle model suggestions across available years and fills model/year when the operator selects a suggestion

#### Scenario: Operator opens pricing guidance
- **WHEN** an internal operator opens the pricing guide on `/admin/promotions`
- **THEN** the system shows a modal with step-by-step guidance and a visual SVG demonstration of pricing filters, standalone simulation, cost/margin inputs, decision reading, and stock comparison

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
- **AND** local fallback matches are restricted by useful title tokens, vehicle type, and a bounded model-year window before contributing price data
- **AND** if only one FIPE year exists for the selected model-year, the page shows an explicit non-chart SVG state instead of drawing a misleading line
- **AND** if the comparison loading state remains active for an unusual duration, the modal explains that the operation may be stalled and instructs the operator to refresh the page

