# Review Template

## Status

`approved|needs correction`

## Entrada revisada

- Branch:
- Resumo do Executor:
- Arquivos alterados:
- Validacoes executadas:
- Diff revisado:

## Findings

### P0

- Nenhum / listar achados criticos.

### P1

- Nenhum / listar achados altos.

### P2

- Nenhum / listar achados medios.

### P3

- Nenhum / listar observacoes baixas.

## Formato de cada finding

```text
Severity:
File/line:
Problem:
Why it matters:
Recommended correction:
```

## Riscos residuais

- Liste riscos que continuam mesmo com status aprovado.

## Prompt de correcao para o Executor

Use apenas se o status for `needs correction`.

```text
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
