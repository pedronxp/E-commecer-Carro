# Task Card: Finalizar Setup Agent Swarm

## Tipo

`docs`

## Branch obrigatoria

`docs/agent-swarm-setup`

## Objetivo

Validar e completar o setup de workflow Agent Swarm neste projeto, sem alterar codigo funcional do app.

## Contexto

O projeto usa Codex IDE como Planner/Reviewer e Opencode como Executor.

Modelo atual:

- Codex IDE: GPT-5.5 High
- Opencode: DeepSeek V4 Flash free MAX

O Executor deve seguir `AGENTS.md` e `docs/llm-workflow.md`.

## Escopo permitido

- `AGENTS.md`
- `opencode.json`
- `.opencode/agents/planner.md`
- `.opencode/agents/executor.md`
- `.opencode/agents/reviewer.md`
- `docs/llm-workflow.md`
- `docs/agent-swarm-setup.md`
- `docs/task-cards/_template.md`
- `docs/reviews/_template.md`
- `docs/agent-swarm/**`
- documentacao relacionada ao fluxo Planner -> Executor -> Reviewer

## Escopo proibido

- Nao alterar `src/`
- Nao alterar `prisma/`
- Nao alterar `public/`
- Nao alterar `package.json` ou `package-lock.json`
- Nao implementar feature
- Nao corrigir bug do produto
- Nao rodar migration
- Nao mexer em layout, admin, carros, login ou APIs

## Tarefa

1. Confirmar que a branch atual e `docs/agent-swarm-setup`.
2. Ler `AGENTS.md`, `opencode.json` e `docs/llm-workflow.md`.
3. Verificar se existem:
   - `docs/agent-swarm-setup.md`
   - `docs/task-cards/_template.md`
   - `docs/reviews/_template.md`
   - `docs/agent-swarm/README.md`
   - `.opencode/agents/planner.md`
   - `.opencode/agents/executor.md`
   - `.opencode/agents/reviewer.md`
4. Se algum arquivo de setup estiver ausente ou incompleto, completar somente esse arquivo.
5. Garantir que `docs/llm-workflow.md` aponta para o guia e templates.
6. Nao alterar codigo funcional.

## Validacoes obrigatorias

```powershell
git status --short --branch
git diff -- AGENTS.md opencode.json docs/llm-workflow.md docs/agent-swarm-setup.md docs/task-cards/_template.md docs/reviews/_template.md docs/agent-swarm .opencode/agents/planner.md .opencode/agents/executor.md .opencode/agents/reviewer.md
```

Nao e necessario rodar `npm run build`, `npm run lint`, `npm run typecheck` ou `npm run test`, porque a tarefa e apenas documentacao/setup de workflow.

## Criterios de aceite

- A branch correta foi confirmada.
- Os arquivos de setup existem.
- O fluxo Planner -> Executor -> Reviewer esta documentado.
- Existe caminho por arquivo para Task Card, resultado, review e correcao.
- Nenhum codigo funcional foi alterado.

## Saida obrigatoria do Executor

Ao final, retorne:

1. Summary of what changed
2. Changed files
3. Validation commands executed
4. Result of each command
5. Risks or pending items
6. Notes for the reviewer
