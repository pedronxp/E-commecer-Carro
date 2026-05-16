# Agent Swarm

Esta pasta guarda os artefatos do fluxo Codex IDE + Opencode.

Use estes arquivos como fonte de verdade para reduzir copia e cola entre ferramentas.

## Estrutura

```text
docs/agent-swarm/
  tasks/             Task Cards aprovadas pelo Planner
  executor-results/  Resumos gerados pelo Executor
  reviews/           Revisoes geradas pelo Reviewer
  corrections/       Prompts de correcao enviados ao Executor
```

## Fluxo recomendado

1. Codex IDE cria uma Task Card em `tasks/`.
2. Opencode Executor le a Task Card e executa somente aquele escopo.
3. Opencode Executor salva ou retorna o resumo em `executor-results/`.
4. Codex IDE revisa o resumo, validacoes e `git diff`.
5. Codex IDE salva a review em `reviews/`.
6. Se precisar de ajuste, Codex IDE cria um prompt em `corrections/`.
7. Opencode Executor corrige somente o prompt de correcao.

## Comando base do Executor

```powershell
opencode run --agent executor --file docs\agent-swarm\tasks\001-agent-swarm-setup.md "Execute a Task Card anexada. Nao implemente nada fora do escopo. Ao final, retorne o resumo obrigatorio do Executor."
```

Se preferir usar a interface do Opencode, abra:

```powershell
opencode --agent executor
```

Depois envie:

```text
Execute a Task Card em docs/agent-swarm/tasks/001-agent-swarm-setup.md. Nao implemente nada fora do escopo.
```

## Regra

O Executor nao decide arquitetura. Ele implementa a Task Card.

O Reviewer nao corrige codigo. Ele aprova ou gera prompt de correcao.
