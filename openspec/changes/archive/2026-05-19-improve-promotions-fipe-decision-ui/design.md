## Context

`/admin/promotions` is the internal "Precificador sem cadastro" workspace for stock diagnostics and standalone vehicle comparison before registration. The current flow already accepts model/year/type, vehicle condition, target margin, store purchase value, FIPE reference, and chart windows, then renders decision cards, FIPE history, and a loading modal.

The remaining problem is comprehension. Operators and managers need to understand how each input changes the recommendation, what terms such as trend/reference quality/difference mean, and why the suggested price is a commercial negotiation reference rather than a future-sale promise. The loading modal also needs to feel aligned with Lima Automotiva instead of generic admin UI.

The change should also tighten the admin UI pattern library in practice. Forms, filters, cards, tables/lists, charts, modals, empty states, and loading states must share predictable layout, spacing, responsive behavior, and action placement so the pricing workflow does not feel like a one-off screen.

The implementation must respect the current Next.js 16 App Router codebase, existing admin architecture, existing domain helpers, and the dirty working tree already present in admin files. Before coding, the Executor must confirm the correct branch/task state.

## Goals / Non-Goals

**Goals:**

- Make the standalone comparison form and result cards self-explanatory for a client/manager audience.
- Show how target margin affects minimum sale price, maximum recommended purchase value, gross margin, and warning states.
- Treat "valor de compra da loja" as the acquisition value the store paid or wants to pay before stock registration, not as a customer offer or sale target.
- Treat vehicle condition as a visible business adjustment, with labels and explanations for every option.
- Replace ambiguous labels with readable commercial terms while keeping underlying calculations intact.
- Improve FIPE analytical reading with clear interpretation of trend, spread, volatility, source confidence, and reference quality.
- Add a separate market-liquidity reading for UF/context, best purchase price, resale likelihood, and purchase sensitivity without changing national FIPE values.
- Improve chart readability with annotations, legend/copy, empty/single-point states, and responsive spacing.
- Redesign comparison loading around Lima Automotiva branding with clear full-viewport steps: FIPE, conservacao, margin, store purchase value, and recommendation.
- Improve form standards for labels, help text, grouped sections, inputs/selects, currency fields, inline guidance, primary/secondary actions, and empty/error/loading states.
- Define and apply responsive layout rules for all admin screen patterns touched by this change: dashboard summaries, form grids, filters, decision cards, chart panels, tables/lists, dialogs, and loading overlays.

**Non-Goals:**

- Do not change the authentication/access model.
- Do not add public customer account behavior.
- Do not create a new FIPE provider integration.
- Do not present liquidity by UF as official FIPE regional pricing.
- Do not promise future sale price, sale forecast, or guaranteed closing value.
- Do not add a new charting dependency unless explicitly approved later.
- Do not introduce a database migration unless implementation proves existing condition/margin data cannot support the UI.
- Do not redesign unrelated public site pages as part of this change.
- Do not rewrite every admin route from scratch; align shared patterns where they are reused or where the current `/admin/promotions` work exposes inconsistent admin layout behavior.

## Decisions

1. Keep calculations in existing pricing helpers and improve presentation around them.

   Rationale: `buildPriceDecision`, `buildPriceGuidance`, `priceConditionAdjustments`, and timeline helpers already encode the core business rules. This change should make those rules visible and testable instead of splitting calculation logic into UI-only copies.

   Alternative considered: rewrite the pricing model from the page component. Rejected because it would increase drift between API/domain guidance and the admin UI.

2. Treat condition options as business factors, not simple select labels.

   Rationale: "Excelente", "Bom", "Com detalhes", and "Precisa reparos" change the FIPE reference. The UI must explain each factor in plain language and show the selected condition in the output so managers can defend the recommendation.

   Alternative considered: leave condition help only in a tooltip. Rejected because the selected condition affects the final number and must be visible in the result state.

3. Replace ambiguous KPI labels with terms that state the decision meaning.

   Rationale: Labels like "Diferenca menor/maior", "Tendencia FIPE", and "Qualidade da referencia" need short explanatory copy next to the value. The card title may remain concise, but the detail must answer "what this means for negotiation".

   Alternative considered: add a long help modal only. Rejected because the cards need to stand alone during daily use.

4. Keep SVG/custom chart rendering but improve visual grammar.

   Rationale: The existing page already uses inline SVG for FIPE charts and single-reference states. Improving annotations, legends, spacing, min/max emphasis, selected point treatment, and missing-reference bands avoids dependency churn and preserves server-rendered page structure.

   Alternative considered: install a chart library. Rejected for now because the need is presentational and the repo has no existing chart dependency.

5. Make the loading modal a branded progress experience.

   Rationale: The user provided Lima Automotiva references with a brand mark/text, green progress, vehicle icons, and decision steps. The modal should cover the whole viewport above the admin shell and communicate that the system is checking FIPE, applying conservation/margin, and comparing the store purchase value while staying responsive and accessible.

   Alternative considered: keep a generic spinner/vehicle animation. Rejected because it does not explain the process and does not match the requested brand treatment.

6. Treat admin forms as a shared interaction pattern.

   Rationale: The same users move between dashboard filters, vehicle creation, taxonomy forms, user management, sell leads, and promotions. Labels, helper text, action placement, input heights, select styling, money fields, section grouping, and empty/error states must be predictable across those patterns.

   Alternative considered: fix only the comparison form. Rejected because the user explicitly requested form improvements and standards, and isolated fixes would leave the admin area inconsistent.

7. Validate layouts by screen pattern, not only by route.

   Rationale: Admin pages combine recurring patterns: summary cards, dense forms, filters, lists/tables, modals, charts, and loading overlays. The implementation should define responsive behavior for each pattern at mobile, tablet, and desktop widths so content does not overlap or become unreadable.

   Alternative considered: rely on ad hoc Tailwind classes per component. Rejected because this task is specifically about consistent layout standards.

8. Add liquidity intelligence as an additive layer, separate from FIPE.

   Rationale: Liquidity can vary by UF and market depth, but the current FIPE/FipeX provider remains a national reference. The system should use UF as a commercial market signal for best purchase price, resale likelihood, listing range, and sensitivity, while leaving `fipeEstimate` and the base pricing decision untouched.

   Alternative considered: adjust FIPE directly by UF. Rejected because it would imply official regional FIPE pricing without a provider that returns that value.

## Risks / Trade-offs

- Visual refinements may touch a large page component -> mitigate by extracting small presentational helpers only when it reduces duplication and by keeping calculation behavior unchanged.
- More explanatory copy can clutter the screen -> mitigate with concise card details, tooltips for secondary context, and responsive layouts that do not overlap on mobile.
- Wider admin layout scope can grow beyond the pricing task -> mitigate by limiting implementation to shared admin patterns touched by this change and documenting any route that still needs a separate future task.
- Existing dirty admin changes may belong to another task -> mitigate by confirming branch/worktree ownership before implementation and avoiding unrelated admin edits.
- Chart labels can overlap with dense FIPE series -> mitigate with deterministic label selection, stable SVG dimensions, legends, and key-point callouts rather than labeling every point.
- Loading animation may delay navigation perception -> keep the existing minimum duration only if it improves feedback, and preserve the slow-operation recovery message.
- Responsive regressions can pass code-only checks -> mitigate with browser verification at representative widths for the main admin screen patterns.
- Liquidity proxy can be mistaken for official market price -> mitigate with explicit source notes, confidence labels, and API fields that keep liquidity separate from FIPE and decision values.
