---
name: backend-pr-reviewer
description: Review backend changes at PR time and recommend commit/PR type as feat, fix, or chore with confidence, rationale, and risk checklist.
---

# Backend PR Reviewer

## Purpose

Provide a backend-focused PR review and a non-blocking recommendation for change type:
- `feat`
- `fix`
- `chore`

The recommendation is advisory only.

## When To Use

Use this skill when the user is preparing or creating a PR and wants:
- backend code review,
- a suggested classification (`feat`, `fix`, `chore`),
- a short rationale with confidence level.

## Backend Scope

Prioritize files such as:
- `src/app/**/route.ts`
- `src/app/**/actions.ts`
- `src/lib/**`
- `prisma/**`
- `src/server/**`
- `src/api/**`

If no backend files changed, state that clearly.

## Classification Rules

- `feat`: introduces new behavior or capability visible to API consumers, business flows, or users.
- `fix`: corrects wrong behavior, defects, regressions, or broken flows.
- `chore`: maintenance/internal updates without meaningful behavior change (refactor, tooling, dependency bumps, cleanup).

If uncertain, do not force certainty:
- return the best suggestion,
- set low confidence,
- request human confirmation.

## Review Checklist

Check and report:
1. Input validation and data sanitization
2. Error handling and status codes
3. Auth/authz and permission boundaries
4. Database access safety (queries, transactions, migration impact)
5. API contract stability (breaking changes, payload shape)
6. Performance concerns (N+1, heavy loops, unnecessary calls)
7. Logging/observability for critical paths

## Output Format

Always return this structure:

```md
Backend PR Review

Type suggestion: <feat|fix|chore>
Confidence: <high|medium|low>

Rationale:
- <1-3 bullets>

Backend risks:
- <risk or "none identified">

Checklist:
- Validation: <ok|pending>
- Error handling: <ok|pending>
- Auth/Authz: <ok|pending>
- Data/DB safety: <ok|pending>
- API contract: <ok|pending>
- Performance: <ok|pending>
- Observability: <ok|pending>

Suggested PR title prefix:
- <feat|fix|chore>
```

## Decision Heuristics

- If changes add a new endpoint, handler capability, or business branch, bias to `feat`.
- If changes target a reported bug/regression and preserve existing intent, bias to `fix`.
- If changes are only structural/internal and behavior-preserving, bias to `chore`.
