# Agent Swarm Setup

Este projeto usa um fluxo manual e controlado entre Codex IDE e Opencode.

## Objetivo

Separar planejamento, execucao e revisao para evitar mudancas grandes sem controle.

Fluxo recomendado:

```text
Codex IDE Planner -> Opencode Executor -> Codex IDE Reviewer -> Commit / PR / Deploy
```

## Estado do projeto

- Stack: Next.js, React, TypeScript, Prisma, Tailwind CSS e Vitest.
- Regras principais: `AGENTS.md` e `docs/llm-workflow.md`.
- Agentes Opencode locais: `.opencode/agents/planner.md`, `.opencode/agents/executor.md` e `.opencode/agents/reviewer.md`.
- Config Opencode local: `opencode.json`.

## Instalacao do Opencode

No Windows, o caminho mais estavel e usar WSL. Tambem e possivel instalar via npm, Chocolatey ou Scoop.

Opcao npm:

```powershell
npm install -g opencode-ai
```

Opcao WSL:

```bash
curl -fsSL https://opencode.ai/install | bash
```

Depois de instalar, valide:

```powershell
opencode --version
```

No ambiente atual (Windows), `opencode` foi validado com versao `1.15.3`. Caso o comando nao esteja disponivel em outro ambiente, use as instrucoes de instalacao acima como fallback.

## Como abrir no projeto

PowerShell:

```powershell
cd "C:\Users\User\Desktop\Projeto\E-commecer carro"
opencode
```

Se usar WSL, entre na pasta equivalente:

```bash
cd "/mnt/c/Users/User/Desktop/Projeto/E-commecer carro"
opencode
```

## Como usar os papeis

### Codex IDE como Planner

Use quando a tarefa ainda precisa de escopo.

Saida esperada:

- Task Card
- escopo permitido
- escopo proibido
- arquivos provaveis
- criterios de aceite
- validacoes obrigatorias
- prompt pronto para o Executor

Template: `docs/task-cards/_template.md`.

### Opencode como Executor

Use somente depois que o Planner gerar e aprovar uma Task Card.

Comando base:

```powershell
opencode --agent executor
```

O Executor deve:

- confirmar branch atual;
- ler `AGENTS.md`;
- seguir `docs/llm-workflow.md`;
- implementar somente a Task Card;
- rodar validacoes;
- devolver resumo, arquivos alterados, resultados e riscos.

### Codex IDE como Reviewer

Use depois do Executor terminar.

Entrada minima:

- resumo do Executor;
- lista de arquivos alterados;
- comandos de validacao e resultados;
- `git diff`.

Template: `docs/reviews/_template.md`.

## Fluxo com menos copia e cola

Para tarefas reais, prefira os artefatos em `docs/agent-swarm/`.

Estrutura:

```text
docs/agent-swarm/
  tasks/
  executor-results/
  reviews/
  corrections/
```

Primeira Task Card deste setup:

```text
docs/agent-swarm/tasks/001-agent-swarm-setup.md
```

O Executor pode receber apenas uma instrucao curta:

```text
Execute a Task Card em docs/agent-swarm/tasks/001-agent-swarm-setup.md. Nao implemente nada fora do escopo.
```

Ou via CLI:

```powershell
opencode run --agent executor --file docs\agent-swarm\tasks\001-agent-swarm-setup.md "Execute a Task Card anexada. Nao implemente nada fora do escopo. Ao final, retorne o resumo obrigatorio do Executor."
```

## Branches

Use uma branch por tarefa:

```text
feat/nome-curto
fix/nome-curto
refactor/nome-curto
test/nome-curto
docs/nome-curto
```

Antes de qualquer implementacao:

```powershell
git status --short --branch
```

Se houver mudancas de outra tarefa, nao misture escopos.

## Validacoes padrao

Antes de considerar uma tarefa pronta:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

Se uma validacao falhar por ambiente, registre o erro exato e separe problema de ambiente de problema de codigo.

## Regra de fechamento

Uma tarefa so fecha quando existir:

1. resumo do Executor;
2. arquivos alterados;
3. validacoes executadas;
4. resultado de cada validacao;
5. revisao com status `approved` ou `needs correction`.

Se o status for `needs correction`, envie apenas o prompt de correcao para o Executor.
