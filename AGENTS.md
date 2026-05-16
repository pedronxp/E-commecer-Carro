<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:llm-workflow-rules -->
# LLM Workflow Rules

When using multiple LLMs for implementation and review, follow `docs/llm-workflow.md`.

Default roles:
- Planner: architecture, scope, prompts, and debugging direction.
- Executor: code implementation only, following the approved task prompt.
- Reviewer: diff review, bug detection, scope control, and correction prompts.

Codex, Opencode, ChatGPT, Claude Code, Cursor, Windsurf, or another IDE agent can fill any role, but each chat/session must keep one role at a time.

Do not start the next task until the current implementation has a summary, validation results, and review status.
<!-- END:llm-workflow-rules -->
