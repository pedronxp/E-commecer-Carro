# Task Card: Nova home page do site

## Tipo

`feat`

## Branch obrigatoria

`feat/nova-home-page-site`

## Objetivo

Criar uma nova home page publica para a Lima Automoveis, com experiencia mais moderna, clara e comercial, mantendo as rotas e a arquitetura existentes do projeto.

## Contexto do projeto

- Stack relevante: Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Tailwind CSS v4, lucide-react, next/image e dados locais/mockados em `src/lib/data.ts`.
- Regras principais: `AGENTS.md`, `docs/llm-workflow.md` e fluxo por artefatos em `docs/agent-swarm/`.
- A home atual e renderizada por `src/app/page.tsx` e componentes em `src/components/home/`.
- Rotas publicas existentes que devem continuar sendo usadas: `/carros`, `/carros/[slug]`, `/financiamento`, `/vender`, `/contato`, `/institucional` e `/faq`.
- Imagens publicas disponiveis: `public/images/banners/home-hero-safe.png`, `catalog-safe.png`, `financing-safe.png` e `sell-car-safe.png`.
- Antes de alterar codigo, leia os guias locais do Next.js em `node_modules/next/dist/docs/01-app/01-getting-started/`, especialmente `03-layouts-and-pages.md`, `05-server-and-client-components.md`, `11-css.md` e `12-images.md`.

## Escopo permitido

- Redesenhar a pagina inicial em `src/app/page.tsx`.
- Alterar, substituir ou criar componentes apenas dentro de `src/components/home/`.
- Reutilizar componentes publicos existentes quando fizer sentido, como `src/components/carros/CarCard.tsx`, `src/components/ui/Button.tsx` e componentes de layout ja existentes.
- Usar dados ja existentes de `src/lib/data.ts`, especialmente `getFeaturedCars()`.
- Ajustar `src/app/globals.css` somente se for indispensavel para classes utilitarias globais da nova home, mantendo o impacto restrito e documentado.
- Usar imagens ja existentes em `public/images/banners/`.
- Usar icones de `lucide-react`, sem adicionar nova biblioteca.
- Melhorar copy publica da home, mantendo tom comercial discreto: compra, venda, financiamento, estoque e atendimento.

## Escopo proibido

- Nao alterar `prisma/`, migrations, schema, seed ou banco.
- Nao alterar APIs em `src/app/api/**`.
- Nao alterar autenticao, sessoes, login, cadastro ou admin.
- Nao alterar `src/components/layout/**`, exceto se houver bug visual bloqueador comprovado e explicado no resumo.
- Nao alterar rotas internas fora da home.
- Nao renomear `/carros` para `/cars` ou introduzir links inexistentes.
- Nao adicionar dependencias nem alterar `package.json` ou lockfile.
- Nao trocar a arquitetura de dados nem remover `getFeaturedCars()`.
- Nao criar landing page generica desconectada do produto; a primeira tela deve comunicar Lima Automoveis e os caminhos reais do site.
- Nao inserir botoes nativos dentro de `next/link` ou outro markup interativo aninhado.

## Arquivos provaveis

- `src/app/page.tsx`
- `src/components/home/HeroCarousel.tsx` ou novo componente equivalente em `src/components/home/`
- `src/components/home/CarGrid.tsx`
- `src/components/home/DecisionSection.tsx`
- `src/components/home/FeaturesSection.tsx`
- `src/components/home/CTASection.tsx`
- `src/app/globals.css` somente se necessario

## Criterios de aceite

- A rota `/` renderiza uma home claramente nova, com primeira dobra forte para Lima Automoveis e chamada direta para estoque, financiamento e venda.
- A home continua usando rotas reais existentes, especialmente `/carros`, `/financiamento`, `/vender` e `/contato`.
- A vitrine de carros em destaque continua funcionando com `getFeaturedCars()` e `CarCard` ou alternativa equivalente sem quebrar `/carros/[slug]`.
- O layout e responsivo em mobile e desktop, sem texto cortado, sobreposicao incoerente, cards desalinhados ou controles que mudem o tamanho do layout no hover.
- Componentes com estado, eventos, `useEffect` ou browser APIs permanecem como Client Components com `"use client"`; componentes estaticos ou orientados a dados devem permanecer Server Components quando possivel.
- Imagens usam `next/image` com `alt`, dimensoes/`fill` e `sizes` adequados para evitar layout shift.
- A pagina preserva header/footer atuais via `AppChrome` e nao quebra navegacao publica.
- O visual usa uma paleta mais rica e profissional, sem depender de uma unica familia de cor nem de excesso de gradientes decorativos.
- Nao ha dependencias novas, nem alteracoes fora do escopo permitido.
- O Executor entrega resumo, arquivos alterados, comandos rodados, resultados e riscos para revisao.

## Comandos de validacao

```powershell
git status --short --branch
npm run lint
npm run typecheck
npm run test
npm run build
```

Validacao visual obrigatoria:

```powershell
npm run dev
```

Depois de iniciar o servidor, abrir e conferir:

- `http://localhost:3000/`
- mobile estreito aproximado de 375px
- desktop aproximado de 1440px

Se a porta 3000 estiver ocupada, usar a porta informada pelo Next.js e registrar isso no resumo.

## Riscos e mitigacoes

- Risco: criar uma home bonita mas desconectada das rotas reais. Mitigacao: usar somente links existentes e validar navegacao principal.
- Risco: transformar a pagina toda em Client Component sem necessidade. Mitigacao: manter interatividade isolada em componentes com `"use client"`.
- Risco: regressao de build por regras novas do Next.js 16. Mitigacao: consultar a documentacao local em `node_modules/next/dist/docs/` antes de alterar e rodar `npm run build`.
- Risco: nested interactive markup com `Link` e `button`. Mitigacao: revisar CTAs e cards clicaveis para evitar elementos interativos aninhados.
- Risco: layout quebrado em mobile por textos longos. Mitigacao: testar primeira dobra, CTAs, cards e vitrine em largura aproximada de 375px.
- Risco: alterar global CSS demais. Mitigacao: priorizar classes Tailwind nos componentes e usar `globals.css` apenas para utilitarios realmente compartilhados.

## Prompt pronto para o Opencode Executor

```text
You are the Executor for this project.

Before implementing:
- Confirm the current branch.
- The required branch for this task is feat/nova-home-page-site.
- If the current branch is not feat/nova-home-page-site, stop and report it. Do not edit files.
- Read AGENTS.md before changing code.
- Read docs/llm-workflow.md.
- Read docs/agent-swarm/README.md.
- Read the local Next.js 16 docs before writing code:
  - node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
  - node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
  - node_modules/next/dist/docs/01-app/01-getting-started/11-css.md
  - node_modules/next/dist/docs/01-app/01-getting-started/12-images.md
- Implement only the approved task below.
- Do not change architecture without approval.
- Do not add dependencies without approval.
- Do not change files outside scope unless required and explained.
- If there is meaningful ambiguity, stop and ask.

Approved task:
Create a new public home page for Lima Automoveis.

Goal:
Redesign the `/` route into a stronger, modern, commercial homepage for a car dealership while preserving the existing Next.js App Router architecture, current routes, current data source, and current public layout.

Allowed scope:
- src/app/page.tsx
- src/components/home/**
- src/app/globals.css only if strictly necessary
- Existing public images under public/images/banners/
- Existing data/helpers such as getFeaturedCars()
- Existing components such as CarCard, Button, BrandLogo, and lucide-react icons when useful

Forbidden scope:
- Do not edit prisma/.
- Do not edit src/app/api/**.
- Do not edit auth, session, login, register, admin, or database code.
- Do not edit package.json or lockfiles.
- Do not add dependencies.
- Do not rename routes or create links to non-existing routes.
- Do not introduce /cars links. Use /carros.
- Do not place native buttons inside next/link or other interactive elements.

Implementation direction:
- Keep AppChrome, Header, and Footer behavior intact.
- Make the first viewport clearly about Lima Automoveis and the real user goals: buy a car, finance, sell/trade a car, and contact the store.
- Use existing banner assets with next/image and proper alt/sizes.
- Keep the featured car section connected to getFeaturedCars().
- Prefer Server Components unless a component needs state, event handlers, useEffect, or browser APIs.
- If using a carousel or other interaction, keep the client boundary isolated to that component.
- Build a polished responsive layout for mobile and desktop.
- Use route CTAs for /carros, /financiamento, /vender, and /contato.
- Keep copy in Portuguese and public-facing.
- Avoid generic filler, exposed internals, fake technical claims, or unsupported business promises.

Acceptance criteria:
- `/` visibly has a new homepage, not a small color tweak.
- Header/footer remain intact.
- Public navigation continues to point to existing routes.
- Featured cars still render and link to their detail pages.
- Mobile and desktop layouts have no obvious overlap, clipped text, broken CTA spacing, or unstable card sizing.
- npm run lint passes.
- npm run typecheck passes.
- npm run test passes or any pre-existing unrelated failure is documented with evidence.
- npm run build passes or any environment-only blocker is documented with evidence.
- Visual smoke check of `/` is performed in dev mode on mobile-like and desktop-like widths.

Validation commands:
1. git status --short --branch
2. npm run lint
3. npm run typecheck
4. npm run test
5. npm run build
6. npm run dev, then inspect http://localhost:3000/ or the port reported by Next.js

At the end, return:
1. Summary of what changed
2. Changed files
3. Validation commands executed
4. Result of each command
5. Risks or pending items
6. Notes for the reviewer
```
