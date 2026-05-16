# LLM Workflow

This project can use two or more LLM/IDE roles without losing context or mixing responsibilities.

The roles are tool-agnostic. Codex, Opencode, ChatGPT, Claude Code, Cursor, Windsurf, or another IDE agent can act as Planner, Executor, or Reviewer as long as the role rules below are followed.

## Roles

Planner:
- Defines scope and acceptance criteria.
- Creates the prompt for the executor.
- Does not implement unless explicitly asked.

Executor:
- Implements only the approved prompt.
- Does not decide architecture.
- Does not add dependencies without explicit approval.
- Does not change files outside the task scope unless required and explained.
- Returns implementation summary, changed files, validation results, and risks.

Reviewer:
- Reviews implementation diffs.
- Finds logic bugs, architecture drift, missing validation, and out-of-scope changes.
- Generates correction prompts when needed.
- Does not implement unless explicitly asked.

## Tool Pairing

Use any pairing, but assign one role per chat/session.

Recommended pairings:
- Codex as Reviewer and Opencode as Executor.
- Codex as Executor and Opencode selected model as Reviewer.
- ChatGPT/GPT as Planner, Codex or Opencode as Executor, and the other as Reviewer.

The integration between different IDEs is manual and artifact-based:
- Planner produces a task prompt.
- Executor produces code changes plus summary, changed files, validation results, and diff.
- Reviewer receives those artifacts and returns approval or a correction prompt.

No role should rely on hidden chat memory from another tool. The handoff artifact is the source of truth.

## Project Setup

Use `docs/agent-swarm-setup.md` as the practical startup guide for Codex IDE plus Opencode in this repository.

Reusable templates:
- Task Card: `docs/task-cards/_template.md`
- Review: `docs/reviews/_template.md`

Artifact-based workflow:
- Tasks: `docs/agent-swarm/tasks/`
- Executor results: `docs/agent-swarm/executor-results/`
- Reviews: `docs/agent-swarm/reviews/`
- Corrections: `docs/agent-swarm/corrections/`

## Standard Flow

1. Planner creates the task prompt.
2. Executor runs the task in the correct branch or workspace.
3. Executor returns the required implementation summary.
4. Reviewer reviews the result.
5. If approved, validate and commit or merge.
6. If not approved, send only the correction prompt back to the Executor.
7. Start the next task only after the current task is approved or explicitly paused.

## Opencode Commands

This project defines native Opencode commands in `opencode.json`.

Use them when working inside Opencode:

- `/llm-plan`: start a Planner task.
- `/llm-execute`: start an Executor task.
- `/llm-summary`: request the required Executor summary.
- `/llm-review`: start a Reviewer pass.
- `/llm-correct`: apply reviewer findings as a focused correction task.
- `/llm-start`: show the workflow menu and choose the right role.

These commands do not replace the role rules. They load the correct workflow prompt so each chat/session starts in the right role.

Each command is designed to be guided. If required inputs are missing, the command should ask for the missing artifact instead of guessing or continuing.

## Branch Rules

- Use a separate branch for each feature, fix, or refactor.
- Suggested names: `feat/name`, `fix/name`, `refactor/name`, `test/name`.
- `main` should contain stable code only.
- Do not merge to `main` until lint, typecheck, build, and review are complete.
- If an IDE creates a new workspace but does not create a branch, ask it to confirm the current branch before editing.

## Executor Prompt Header

Use this header before pasting a Planner task into the Executor, regardless of IDE:

```txt
You are the Executor for this project.

Before implementing:
- Confirm the current branch.
- If the branch is not correct for this task, stop and report it.
- Read AGENTS.md before changing code.
- Follow docs/llm-workflow.md.
- Implement only the approved task below.
- Do not change architecture without approval.
- Do not add dependencies without approval.
- Do not change files outside scope unless required and explained.
- If there is meaningful ambiguity, stop and ask.

At the end, return:
1. Summary of what changed
2. Changed files
3. Validation commands executed
4. Result of each command
5. Risks or pending items
6. Notes for the reviewer

[PASTE APPROVED TASK HERE]
```

## Ask Opencode For Summary

After the Executor finishes, ask this if the final summary is missing:

```txt
Before starting any other task, return a summary of the current implementation.

Required format:
1. Summary of what was done
2. Changed files
3. Validation commands executed
4. Result of each command
5. Risks or pending items
6. Important notes for the reviewer

Do not implement anything new.
Do not change files.
Only answer with the summary.
```

## Reviewer Prompt

Use this prompt for the Reviewer after the Executor implements a task:

```txt
You are the technical reviewer for this project.

Context:
- The implementation was completed by the Executor.
- Your job is to review the result, not implement a new feature.
- The project follows AGENTS.md and docs/llm-workflow.md.

Review the implementation for:
1. Logic bugs
2. Architecture drift
3. App Router, Server Component, or Server Action issues
4. Regressions in existing flows
5. Missing edge cases
6. Missing validation
7. Out-of-scope changes
8. Lint, typecheck, build, or test risks

Required response format:
- Status: approved / needs correction
- Findings ordered by severity
- For each finding: severity, file/line, problem, why it matters, recommended correction
- Residual risks
- If corrections are needed, provide a focused prompt to send back to the Executor

Implementation data:

Summary from Executor:
[PASTE SUMMARY]

Changed files:
[PASTE CHANGED FILES]

Validation results:
[PASTE VALIDATION RESULTS]

Diff:
[PASTE DIFF]
```

## Correction Prompt

If the Reviewer finds issues, send only this kind of focused correction prompt to the Executor:

```txt
You are the Executor for this project.

The review found the issues below.
Fix only these issues.
Do not implement the next task.
Do not refactor unrelated code.
Do not change architecture unless the correction explicitly requires it.

Issues to fix:
[PASTE REVIEW FINDINGS]

At the end, return:
1. Summary of corrections
2. Changed files
3. Validation commands executed
4. Result of each command
5. Remaining risks or pending items
```

## Validation Gate

Before considering a task complete, run the available project checks:

```bash
npm run lint
npm run typecheck
npm run build
```

If a script does not exist, report it and run the closest available equivalent.

## Completion Rules

- Approved review plus passing validation means the task can be committed or merged.
- Failed review means the Executor receives a correction prompt before any new feature starts.
- Never stack a new task on top of an unreviewed or failing implementation unless explicitly pausing the previous task.
- Keep each task small enough to review in one diff.
