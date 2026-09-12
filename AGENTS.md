# AGENTS.md

Guia para agentes de IA (Claude Code, Cursor, etc.) trabalhando neste repositório.

## Visão geral do projeto

Eteron Hub é um marketplace B2B do setor de metalurgia e estruturas metálicas:
conecta empresas a trabalhadores/prestadores de serviço. Vagas passam por
moderação e são publicadas de forma anônima; trabalhadores compram créditos via
Pix para desbloquear os dados de contato da empresa.

Monorepo pnpm com dois apps e dois pacotes compartilhados:

- `apps/api` — backend NestJS (Clean Architecture), Prisma/PostgreSQL, integração
  direta com a API Pix do Banco Inter.
- `apps/web` — frontend Next.js.
- `packages/shared-types` — tipos compartilhados entre api e web.
- `packages/config` — configuração base (tsconfig) compartilhada.

Documentação de produto e arquitetura em [docs/](docs/):
[01-produto-e-regras-de-negocio.md](docs/01-produto-e-regras-de-negocio.md),
[02-modelo-de-dominio.md](docs/02-modelo-de-dominio.md),
[03-arquitetura-tecnica.md](docs/03-arquitetura-tecnica.md),
[04-roadmap-mvp.md](docs/04-roadmap-mvp.md),
[05-operacao-e-lancamento.md](docs/05-operacao-e-lancamento.md).

## Build & test

Rodar tudo a partir da raiz do monorepo (pnpm workspaces):

```bash
pnpm install                        # instala dependências de todos os workspaces
pnpm --filter api run prisma:generate  # gera o Prisma Client (necessário antes de build/test/dev da api)
pnpm lint                           # eslint em todo o monorepo
pnpm test                           # testes da api (jest)
pnpm build                          # build de api e web
pnpm --filter api run dev           # sobe a api em modo watch
pnpm --filter web run dev           # sobe o web (Next.js) em modo watch
```

O CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) roda, nesta ordem:
install com lockfile congelado → `prisma:generate` → `lint` → `test`. Rode os
mesmos passos localmente antes de abrir um PR.

## Arquitetura e convenções

`apps/api/src` segue Clean Architecture por módulo de domínio (ex.: `company`,
`worker`, `job-posting`, `job-unlock`, `credit`, `payment`, `moderation`,
`admin`), cada um dividido em camadas Domain → Application → Infra, mais
`shared-kernel` (domain/application/infra comuns) e `infra/http` /
`infra/prisma` para adaptadores de borda. Veja
[docs/03-arquitetura-tecnica.md](docs/03-arquitetura-tecnica.md) para o mapeamento
completo de camadas e contratos de API.

Regras não-negociáveis:

- Não pule camadas: código de domínio (`domain/`) não pode importar Prisma,
  NestJS, ou qualquer detalhe de infraestrutura. Regras de negócio vivem no
  domínio/aplicação, nunca em controllers ou repositórios.
- Toda alteração em fluxo de crédito/pagamento Pix deve considerar
  reconciliação e idempotência — veja o runbook em
  [docs/05-operacao-e-lancamento.md](docs/05-operacao-e-lancamento.md) antes de
  mexer em `payment/` ou `credit/`.
- Dados de contato da empresa só podem ser expostos a um worker depois do fluxo
  de desbloqueio (`job-unlock`) confirmar o consumo de crédito — nunca vaze
  esse dado antes da checagem de autorização.
- `apps/web` consome a api via `src/lib/api`; não hardcode URLs de API fora
  desse client.
- Novas migrations Prisma exigem `pnpm --filter api run prisma:generate` antes
  de rodar testes ou build.
- Textos e nomes de domínio voltados ao usuário ficam em português (pt-BR);
  identificadores de código seguem inglês.

## Skills e comandos disponíveis

Este repo tem skills compartilhadas entre Claude Code, Cursor, Windsurf e
Copilot em `.claude/skills`, `.cursor/skills`, `.windsurf/skills` e
`.github/skills` (mesmo conteúdo, replicado por ferramenta). Comandos/workflows
específicos do Claude Code estão em [.claude/commands/](.claude/commands/).
