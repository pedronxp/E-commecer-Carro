# Admin Pattern Notes

## Covered In This Change

- `/admin/promotions`: standalone comparison form, stock filters, decision cards, FIPE analytics, FIPE charts, empty states, and comparison loading modal.
- Shared admin shell treatment already present in this branch: sidebar, topbar, admin surface, operator status, panel/card treatment, input/select styling, and compact mobile spacing.
- Reused admin form patterns: labels with help, money fields, select fields, primary/secondary actions, clear actions, disabled states, and inline guidance.
- Responsive checkpoints required for implementation review: mobile, tablet, desktop, and wide desktop.

## Patterns To Keep Consistent

- Form sections should group related decisions and keep field help near the field.
- Dense data should stack into cards or controlled scroll regions on small screens without hiding labels or primary actions.
- Charts should keep a readable legend, axis labels, selected reference, min/max callouts, and explicit missing-data treatment.
- Loading states should explain what is being processed and keep the operator oriented.

## Future Tasks Outside This Change

- Full route-by-route audit of every admin table and form remains a separate task if the reviewer finds pages outside `/admin/promotions` still inconsistent.
- Public site layout and marketing pages are intentionally outside this change.
