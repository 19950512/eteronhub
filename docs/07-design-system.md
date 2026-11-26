# Eteron Hub — Design System

Guia visual e de front-end do `apps/web`. A vitrine viva, com todos os componentes
renderizados, fica em **`/design-system`** (fora do índice dos buscadores).

## Princípios

1. **Mobile-first.** O CSS base é o celular; telas maiores entram por
   `@media (min-width: …)`. Breakpoints usados: `560px`, `640px`, `768px`, `900px`
   (navegação desktop), `960px` (layouts com barra lateral) e `1024px`.
2. **App, não site.** No celular há tab bar fixa no rodapé, alvos de toque de no
   mínimo 44px, áreas seguras (`env(safe-area-inset-*)`) e campos com fonte de 16px
   (evita o zoom automático do iOS).
3. **Laranja é ação.** O laranja "Fagulha" sinaliza o que é clicável e importante. O
   resto da interface é neutro (tons de "Aço").
4. **Claro e escuro automáticos.** Cores sempre por token semântico; o tema escuro
   segue `prefers-color-scheme`.
5. **Texto em pt-BR, código em inglês** (regra do `AGENTS.md`).
6. **Linha, não sombra.** Estética de chão de fábrica: cantos quase retos (2–4px),
   divisórias de 1–2px em vez de cards com sombra, fundo cor de papel e neutros
   quentes (grafite). Evite os clichês de template: rótulo laranja em caixa alta
   acima de cada título, ícone dentro de quadradinho colorido, grade de cards
   idênticos, degradês e blur. Listas (vagas, funções, passos) são linhas com
   régua, não cards.

## Estrutura

| Arquivo                         | Conteúdo                                                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/tokens.css`         | Paletas `--spark-*` / `--steel-*`, cores semânticas (`--color-*`), tipografia, espaçamento, raios, sombras, z-index e o tema escuro |
| `src/styles/base.css`           | Reset, tipografia base, foco visível, utilitários de texto                                                                          |
| `src/styles/layout.css`         | Container, header, drawer, tab bar, footer, grids                                                                                   |
| `src/styles/components.css`     | Botões, cards, badges, chips, alertas, formulários, skeleton, estado vazio                                                          |
| `src/styles/sections.css`       | Composições de página: home (`intro`, `block`, `trades`, `how`, `closing`), lista de vagas, auth, vaga, Pix                         |
| `src/styles/utilities.css`      | `stack*` / `cluster*` — **importado por último** para vencer o `display` dos componentes                                            |
| `src/components/ui/`            | `Alert`, `Field`, `PageHeader`, `EmptyState`, `Spinner`/`PageLoading`, `StatusBadge`                                                |
| `src/components/brand/logo.tsx` | `Logo` e `LogoMark`                                                                                                                 |
| `src/components/jobs/`          | `JobCard`, `JobCardSkeleton`, `JobResults`, `JobBoard`                                                                              |
| `src/assets/images/index.ts`    | Fotos do setor, com texto alternativo e crédito                                                                                     |

Regra de ouro: **não use cores hexadecimais nem medidas soltas em componentes.** Use
`var(--color-*)`, `var(--space-*)`, `var(--radius*)`.

## Tokens principais

- **Ação:** `--color-primary` (Spark 700 `#b5470b` no claro, com texto quase
  branco; Spark 500 com texto escuro no tema escuro).
- **Régua:** `--color-rule` (traço forte de 1–2px sob o header, cabeçalhos de página
  e no topo de listas).
- **Texto:** `--color-text`, `--color-text-muted` (contraste ≥ 4,5:1 sobre
  `--color-surface` e `--color-bg`).
- **Status:** `--color-success|warning|danger|info` + `-soft` (fundo) e `-border`.
- **Tipografia:** uma família só, **Archivo** variável (eixo `wdth`), via
  `next/font`. Títulos usam a mesma fonte estreitada (`font-stretch:
var(--display-stretch)`, peso 800); texto na largura normal. Tamanhos fluidos com
  `clamp()` (`--text-2xl`, `--text-3xl`, `--text-display`).

## Componentes (classes)

- **Botões:** `btn` + `btn-primary | btn-secondary | btn-ghost | btn-danger |
btn-danger-outline | btn-on-dark`, tamanhos `btn-sm | btn-lg`, `btn-block`. Um
  primário por bloco.
- **Cards:** `card`, `card-interactive` (links), `card-inverse` (destaque escuro),
  `card-section` (divisão interna). Use só para blocos de ação (formulários, saldo,
  pacotes); listagens usam `job-list` / `job-row`.
- **Status de vaga:** sempre `<StatusBadge status={...} />` — o mapeamento fica em
  `lib/format.ts`.
- **Formulários:** `<Field id label hint optional>` envolvendo o `input`; agrupe com
  `fieldset.fieldset` + `legend.fieldset-legend`; dois campos lado a lado com
  `field-row`; prefixos (R$, ícone) com `input-group`.
- **Carregamento:** prefira skeletons (`skeleton`, `JobCardSkeleton`) a textos de
  "Carregando...". Para telas inteiras, `<PageLoading />`.
- **Vazio e erro:** `<EmptyState>` explica o porquê e oferece o próximo passo;
  erros usam `<Alert tone="error">` (anuncia para leitores de tela).

## Imagens

- Ficam em `src/assets/images/` e são importadas estaticamente (o Next gera WebP/AVIF
  e `srcset`). Toda foto **precisa** estar registrada em `marketImages`, com `alt` e
  crédito — a página `/creditos-de-imagens` é gerada a partir dele.
- Fontes atuais: Wikimedia Commons, domínio público e CC BY 2.0 (exige atribuição).
  Não use fotos sem licença clara.

## PWA / Web App

- `src/app/manifest.ts` → `/manifest.webmanifest` (standalone, atalhos para Vagas,
  Painel e Créditos).
- Ícones: `src/app/icon.svg` (favicon vetorial), `src/app/favicon.ico`,
  `src/app/apple-icon.png`, e `public/icons/` (192, 512 e 512 maskable). O desenho
  do `LogoMark` e do `icon.svg` deve ser idêntico; se mudar a marca, regere os PNGs a
  partir do `icon.svg` (fundo `#0e1319`; a marca ocupa ~72% nos ícones comuns e ~56%
  no maskable, para caber na área segura).
- `src/app/opengraph-image.jpg` é o preview de links (WhatsApp, LinkedIn). A URL
  absoluta vem de `NEXT_PUBLIC_SITE_URL` (padrão `https://eteronhub.com.br`).
- Service worker em `public/sw.js`, registrado só em produção. **Ele nunca guarda
  HTML de páginas nem respostas da API** — apenas assets versionados
  (`/_next/static`, `/_next/image`, `/icons`) e a página `/offline`, usada quando a
  navegação falha sem rede. Ao mudar a estratégia de cache, troque `VERSION` no
  arquivo para descartar o cache antigo.
- O `Dockerfile` copia `public/` para a imagem standalone; sem isso, ícones e SW
  respondem 404 em produção.
