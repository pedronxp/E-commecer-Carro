# Task Card: Fluxo de venda/consignacao e ajuste LGPD de cookies

## Tipo

`feat`

## Branch obrigatoria

`feat/venda-consignacao-lgpd-flow`

## Base recomendada

Crie a branch a partir de `main` atualizado, nao a partir de uma branch de fix administrativo, para evitar empilhar a feature em cima das Tasks 003/004.

## Objetivo

Corrigir o comportamento do banner de cookies/LGPD e transformar a pagina `/vender` em um fluxo claro para o cliente enviar um veiculo para venda direta ou consignacao, com persistencia e leitura administrativa.

## Contexto do projeto

- Stack: Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Prisma/PostgreSQL, Zod, Tailwind CSS v4, Vitest.
- Regras principais: `AGENTS.md`, `docs/llm-workflow.md` e artefatos em `docs/agent-swarm/`.
- Fluxo publico existente:
  - `src/app/vender/page.tsx` ja possui Server Action `createSellLead()` e cria registros em `prisma.sellLead`.
  - `src/components/layout/CookieConsent.tsx` ja salva preferencias em `localStorage` e cookie, e escuta `lima:open-cookie-preferences`.
  - `src/components/layout/Footer.tsx` ja possui botao "Cookies" que dispara esse evento.
  - `src/app/lgpd/page.tsx` e `src/app/privacidade/page.tsx` explicam tratamento de dados.
- Fluxo admin existente:
  - `src/app/admin/sell-leads/page.tsx` lista leads, permite status, canal de atendimento, proxima acao, nota interna e anonimizar dados.
  - `src/app/admin/page.tsx` mostra metricas e ultimos leads.
- Modelo atual:
  - `SellLead` tem dados de contato, veiculo, status, canal, notas, consentimento e datas.
  - Nao ha campo estruturado para diferenciar venda direta de consignacao.
- Antes de alterar codigo, leia os guias locais do Next.js em `node_modules/next/dist/docs/`, especialmente:
  - `01-app/01-getting-started/03-layouts-and-pages.md`
  - `01-app/01-getting-started/05-server-and-client-components.md`
  - `01-app/01-getting-started/07-mutating-data.md`
  - `01-app/01-getting-started/11-css.md`

## Problemas a resolver

1. O banner de cookies precisa ter comportamento consistente: aparecer quando nao ha consentimento valido, salvar/rejeitar preferencias de forma previsivel e permitir reabrir preferencias sem duplicar estado.
2. A pagina `/vender` fala em venda, mas nao separa venda direta e consignacao como intencao comercial.
3. A Server Action de `/vender` valida campos manualmente, sem schema compartilhado.
4. O admin recebe leads, mas nao enxerga de forma estruturada se o cliente quer vender direto, consignar ou avaliar as duas possibilidades.
5. A copia LGPD do formulario deve ser clara sobre finalidade, consentimento e canal de contato.

## Escopo permitido

- Ajustar `src/components/layout/CookieConsent.tsx` para comportamento consistente de preferencias, incluindo:
  - leitura tolerante a payload invalido;
  - exibicao quando versao ausente/desatualizada;
  - salvar preferencias opcionais de forma unica;
  - reabrir preferencias pelo evento existente;
  - manter cookies necessarios sempre ativos.
- Criar componente client pequeno apenas se necessario para abrir preferencias a partir de paginas estaticas, por exemplo `src/components/layout/CookiePreferencesButton.tsx`.
- Ajustar `src/app/lgpd/page.tsx` e/ou `src/app/privacidade/page.tsx` somente para expor uma acao visivel de revisar preferencias e alinhar texto ao novo fluxo.
- Ajustar `src/app/vender/page.tsx` para:
  - explicar venda direta vs consignacao;
  - incluir selecao obrigatoria de intencao (`venda direta`, `consignacao`, ou `quero avaliar as duas`);
  - melhorar os campos do veiculo sem transformar a tarefa em cadastro completo de estoque;
  - preservar Server Action no App Router;
  - redirecionar com mensagens claras de sucesso/erro.
- Criar schema Zod compartilhado em `src/lib/schemas.ts` ou helper dedicado se fizer sentido.
- Alterar `prisma/schema.prisma` e adicionar migration para persistir a intencao do lead, por exemplo enum/campo `SellLeadIntent`.
- Atualizar `src/app/admin/sell-leads/page.tsx` para exibir e, se simples, filtrar/contabilizar a intencao do lead.
- Atualizar `src/app/admin/page.tsx` somente se necessario para refletir a intencao nos ultimos leads ou metricas.
- Adicionar/ajustar testes unitarios para validacao do schema/helper de lead e, se extraido, leitura/escrita de preferencias de cookies sem depender de browser real.

## Escopo proibido

- Nao alterar `src/app/layout.tsx` porque ha worktree paralela com mudanca nao commitada nesse arquivo.
- Nao redesenhar home, catalogo, `/carros`, cards de carro, busca ou hero.
- Nao alterar FIPE, `src/app/admin/promotions/page.tsx`, `src/lib/pricing-insights.ts` ou testes de precificacao.
- Nao alterar autenticacao, login/logout, sessao, roles ou middleware.
- Nao implementar CRUD completo para converter lead em veiculo do estoque.
- Nao adicionar integracao externa, WhatsApp API, e-mail transacional, analytics real ou pixel de marketing.
- Nao adicionar dependencias sem aprovacao explicita.
- Nao mudar dados de carros existentes nem seeds fora do estritamente necessario para migration de schema.
- Nao remover o fluxo atual de anonimizar lead no admin.

## Arquivos provaveis

- `src/components/layout/CookieConsent.tsx`
- `src/components/layout/CookiePreferencesButton.tsx` se criado
- `src/app/lgpd/page.tsx`
- `src/app/privacidade/page.tsx` somente se necessario
- `src/app/vender/page.tsx`
- `src/app/admin/sell-leads/page.tsx`
- `src/app/admin/page.tsx` somente se necessario
- `src/lib/schemas.ts`
- `prisma/schema.prisma`
- `prisma/migrations/<timestamp>_add_sell_lead_intent/migration.sql`
- `src/lib/*.test.ts` se helper/schema testavel for criado ou alterado

## Criterios de aceite

- Visitante sem consentimento valido ve o banner de cookies nas paginas publicas.
- Ao escolher "Aceitar todos", preferencias opcionais ficam salvas e o banner nao reaparece no refresh.
- Ao escolher "Somente necessarios" ou recusar opcionais, analytics/marketing ficam `false` e o banner nao reaparece no refresh.
- O botao de cookies no rodape reabre as preferencias com o estado salvo.
- A pagina LGPD ou privacidade oferece forma clara de revisar preferencias, sem depender de console ou URL especial.
- Payload invalido em `localStorage` nao quebra a pagina e faz o banner pedir novo consentimento.
- `/vender` deixa claro que o cliente pode solicitar venda direta, consignacao ou avaliacao das duas opcoes.
- O formulario de `/vender` exige dados minimos: nome, contato, modelo do veiculo, intencao comercial e consentimento LGPD.
- Dados numericos invalidos de ano/quilometragem nao geram `NaN` persistido.
- O lead criado persiste a intencao comercial em campo estruturado, nao apenas em texto livre.
- `/admin/sell-leads` mostra a intencao comercial de cada lead de forma escaneavel.
- O admin continua podendo atualizar status, canal, proxima acao, nota interna e anonimizar dados.
- A migration Prisma e o client gerado ficam consistentes.
- A tarefa nao altera auth, FIPE, catalogo publico ou layout raiz.
- O Executor entrega resumo, arquivos alterados, comandos executados, resultado de cada comando, riscos e notas para o Reviewer.

## Comandos de validacao

```powershell
git status --short --branch
npx prisma generate
npm run lint
npm run typecheck
npm run test
npm run build
```

Validacao funcional recomendada:

```powershell
npm run dev
```

Conferir no navegador:

- `http://localhost:3000/vender`
- `http://localhost:3000/lgpd`
- `http://localhost:3000/privacidade`
- `http://localhost:3000/admin/sell-leads` com usuario admin logado, se o ambiente local permitir

Se o ambiente local nao tiver `DATABASE_URL`, registrar o bloqueio no resumo e separar falha de ambiente de falha de codigo.

## Riscos e mitigacoes

- Risco: conflitar com a worktree `feat/layout-base`, que tem alteracao aberta em `src/app/layout.tsx`.
  - Mitigacao: nao tocar em `src/app/layout.tsx`; usar componentes ja montados pelo chrome publico.
- Risco: transformar lead de venda em CRUD de estoque.
  - Mitigacao: limitar a tarefa a captura, persistencia e triagem do lead.
- Risco: LGPD virar texto juridico longo sem comportamento validavel.
  - Mitigacao: aceitar a tarefa somente com comportamento verificavel de banner, preferencias e consentimento.
- Risco: migration quebrar ambiente local sem banco.
  - Mitigacao: criar migration pequena, rodar `npx prisma generate`, e documentar bloqueio de `build`/runtime quando `DATABASE_URL` estiver ausente.
- Risco: Server Action receber dados invalidos.
  - Mitigacao: usar Zod/coercao segura e redirecionar com erro sem persistir payload ruim.
- Risco: estado duplicado entre cookie e localStorage.
  - Mitigacao: centralizar leitura/escrita em helpers pequenos dentro do componente ou em modulo testavel.

## Prompt pronto para o Opencode Executor

```text
You are the Executor for this project.

Before implementing:
- Confirm the current branch.
- The required branch for this task is feat/venda-consignacao-lgpd-flow.
- If the current branch is not feat/venda-consignacao-lgpd-flow, stop and report it. Do not edit files.
- Read AGENTS.md before changing code.
- Read docs/llm-workflow.md.
- Read docs/agent-swarm/README.md.
- Read the local Next.js 16 docs before writing code:
  - node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
  - node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
  - node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md
  - node_modules/next/dist/docs/01-app/01-getting-started/11-css.md
- Implement only the approved task below.
- Do not change architecture without approval.
- Do not add dependencies without approval.
- Do not change files outside scope unless required and explained.
- If there is meaningful ambiguity, stop and ask.

Approved task:
Fix the LGPD/cookie preference behavior and create a customer flow on /vender for submitting a vehicle for direct sale or consignment.

Goal:
Make cookie consent behavior predictable and make /vender capture a structured commercial intent: direct sale, consignment, or evaluate both.

Allowed scope:
- src/components/layout/CookieConsent.tsx
- src/components/layout/CookiePreferencesButton.tsx if a tiny client button is needed
- src/app/lgpd/page.tsx
- src/app/privacidade/page.tsx only if needed for aligned privacy copy or preference action
- src/app/vender/page.tsx
- src/app/admin/sell-leads/page.tsx
- src/app/admin/page.tsx only if needed to display lead intent in summaries
- src/lib/schemas.ts or a small dedicated schema/helper file
- prisma/schema.prisma
- a new Prisma migration for the lead intent field
- focused tests for schema/helper behavior if practical

Forbidden scope:
- Do not edit src/app/layout.tsx.
- Do not edit home, catalog, /carros, car cards, search, hero, or public inventory flows.
- Do not edit FIPE, admin promotions, pricing insights, auth, session, roles, login/logout, or middleware.
- Do not implement vehicle stock CRUD or conversion from lead to stock.
- Do not add WhatsApp API, email automation, real analytics, marketing pixel, or external integrations.
- Do not add dependencies.
- Do not remove admin lead anonymization.

Implementation direction:
- Keep CookieConsent as a client component.
- Make consent read/write robust against invalid localStorage payloads and version mismatch.
- Preserve necessary cookies as always active.
- Ensure Accept all saves analytics=true and marketing=true.
- Ensure only necessary/reject optional saves analytics=false and marketing=false.
- Ensure the footer Cookies button reopens saved preferences with the correct state.
- Add a visible way from LGPD or privacy page to reopen cookie preferences, using a small client component if needed.
- Update /vender so the visitor chooses one required commercial intent: direct sale, consignment, or evaluate both.
- Validate the /vender Server Action with safe parsing, preferably Zod, so invalid year/mileage do not persist NaN.
- Persist the lead intent in a structured Prisma field, not only inside notes.
- Show the lead intent in /admin/sell-leads in a compact, readable way.
- Keep admin status/channel/next-action/admin-note/anonymize behavior working.

Acceptance criteria:
- A visitor without valid consent sees the cookie banner on public pages.
- Accept all persists optional preferences and the banner stays hidden after refresh.
- Only necessary/reject optional persists analytics=false and marketing=false and the banner stays hidden after refresh.
- The footer Cookies button reopens the preferences with saved state.
- LGPD or privacy page exposes a visible action to review cookie preferences.
- Invalid localStorage consent payload does not crash the page and causes consent to be requested again.
- /vender clearly supports direct sale, consignment, and evaluate both.
- /vender requires name, contact, vehicle model, commercial intent, and LGPD consent.
- Invalid numeric fields are ignored or rejected safely, never stored as NaN.
- Created SellLead records include the structured commercial intent.
- /admin/sell-leads displays each lead intent.
- Existing admin lead flow still works: status, channel, next action, admin note, anonymization.
- No changes are made to auth, FIPE, catalog, home, or root layout.

Validation commands:
1. git status --short --branch
2. npx prisma generate
3. npm run lint
4. npm run typecheck
5. npm run test
6. npm run build

Functional smoke, if environment permits:
- npm run dev
- Open http://localhost:3000/vender
- Open http://localhost:3000/lgpd
- Open http://localhost:3000/privacidade
- Open http://localhost:3000/admin/sell-leads with an admin session

At the end, return:
1. Summary of what changed
2. Changed files
3. Validation commands executed
4. Result of each command
5. Risks or pending items
6. Notes for the reviewer
```
