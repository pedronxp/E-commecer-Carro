# Task Card

## Tipo

`feat|fix|refactor|test|docs`

## Branch sugerida

`tipo/nome-curto`

## Objetivo

Descreva o resultado esperado em uma frase.

## Contexto do projeto

- Stack relevante:
- Fluxo afetado:
- Evidencias ou sintomas:

## Escopo permitido

- Arquivos, pastas ou comportamentos que podem ser alterados.

## Escopo proibido

- Arquivos, pastas ou comportamentos que nao devem ser alterados.

## Arquivos provaveis

- `src/...`
- `prisma/...`
- `tests/...`

## Criterios de aceite

- O comportamento esperado fica visivel/validavel.
- Nao ha regressao nos fluxos existentes afetados.
- A tarefa respeita `AGENTS.md` e `docs/llm-workflow.md`.

## Validacoes obrigatorias

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## Riscos e mitigacoes

- Risco:
- Mitigacao:

## Prompt pronto para o Executor

```text
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
