# Review: Task 005 - Venda/consignacao e LGPD

## Status

approved

## Findings

No blocking findings.

## Review Notes

- The implementation stayed inside the approved scope for Task 005.
- The root layout, auth, FIPE/pricing, catalog and home flows were not changed.
- `/vender` now captures structured commercial intent for direct sale, consignment, or evaluating both options.
- `SellLeadIntent` was added to Prisma with a default for existing rows.
- The admin sell-leads flow now displays lead intent without removing status, channel, next action, internal note or anonymization behavior.
- Cookie preferences were extracted into a small helper and remain driven by the existing public chrome/banner pattern.
- LGPD/privacy pages expose a visible action to reopen cookie preferences.
- The earlier review finding was corrected: blank optional `year` and `mileage` values now parse as absent instead of rejecting valid leads or storing blank mileage as `0`.

## Corrected Finding Verification

The correction added `blankToOptional()` plus `z.preprocess()` around `year` and `mileage` in `src/lib/schemas.ts`.

The tests now cover:

- blank year accepted as absent;
- blank mileage accepted as absent;
- non-numeric year rejected;
- year below minimum rejected;
- negative mileage rejected;
- mileage above maximum rejected;
- non-numeric mileage rejected.

## Residual Risks

- The Prisma migration was not applied against a live database during review. It still needs to be applied in the target environment before production use.
- Cookie preferences were reviewed by code and build gates, not browser automation. A quick manual smoke on `/lgpd`, `/privacidade` and the footer Cookies button is still useful before deploy.

## Validation Run By Reviewer

```powershell
git diff --check
npm run lint
npm run typecheck
npm run test
npm run build
```

Results:

- `git diff --check`: passed
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test`: passed, 3 files and 31 tests
- `npm run build`: passed, 26 routes generated
