# Arquitetura Técnica — EteronHub

Este documento descreve como o modelo de domínio de [02-modelo-de-dominio.md](02-modelo-de-dominio.md) é implementado: stack, camadas e regra de dependência, estrutura de pastas do monorepo, a integração direta com a API Pix do Banco Inter, e os contratos de API expostos ao frontend.

## 1. Stack

| Camada | Tecnologia |
|---|---|
| Backend | NestJS (TypeScript) |
| ORM / banco | Prisma + PostgreSQL |
| Frontend | Next.js (App Router, TypeScript, React) |
| Autenticação | JWT (empresa/trabalhador), sessão separada para admin |
| Monorepo | pnpm workspaces |
| Testes | Jest — testes unitários para Domain/Application (sem mocks de banco), testes de integração para Infra (contra um Postgres real, via Testcontainers ou banco de teste dedicado) |
| Agendamento de jobs | `@nestjs/schedule` (`@Cron`) |

Não há gateway de pagamento terceirizado (Stripe, PagSeguro, etc.): a integração com o Pix é feita **diretamente** com a API do Banco Inter. Essa decisão de infraestrutura fica isolada detrás da porta `PixPaymentGateway` (definida no módulo `payment`, ver seção 4), então trocar ou adicionar um provedor no futuro é uma mudança de Infra, não de domínio.

## 2. Camadas e regra de dependência

Cada módulo de negócio (`company`, `worker`, `job-posting`, `moderation`, `credit`, `payment`, `job-unlock`, `admin`) é dividido internamente em quatro camadas:

| Camada | Conteúdo | Pode depender de |
|---|---|---|
| **Domain** | Entidades, value objects, erros de domínio (ex.: `InsufficientCreditsError`). Nenhuma referência a NestJS, Prisma, HTTP ou qualquer biblioteca externa. | nada (nem de outra camada) |
| **Application** | Casos de uso (use cases/services) e as **portas** (interfaces) que eles precisam: repositórios (`CompanyRepository`), gateways (`PixPaymentGateway`) e a `UnitOfWork`. | Domain |
| **Infra** | Implementações concretas das portas: repositórios Prisma, o adapter `BancoInterPixGateway`, o `PrismaUnitOfWork`, jobs agendados. | Application, Domain |
| **Container** | Módulos NestJS (`@Module`), controllers HTTP, DTOs de entrada/saída, guards, decorators. É a única camada que sabe que o transporte é HTTP e que a Infra usa Prisma — faz a fiação (DI) entre a interface de porta e sua implementação concreta. | Application (para chamar casos de uso), Infra (apenas para registrar os providers concretos no `Module`) |

Regra de dependência (seta = "depende de", sempre em direção ao centro):

```
Container ──▶ Infra ──▶ Application ──▶ Domain
     └───────────────────────▶ (Container também depende de Application diretamente)
```

Nenhuma classe de Domain ou Application importa `@nestjs/*`, `@prisma/client` ou `fetch`/`axios`. Isso é o que permite testar 100% das regras de negócio (as 27 regras do documento 1) com testes unitários puros, sem subir banco nem framework.

## 3. Estrutura de pastas do monorepo

```
eteronhub/
├── apps/
│   ├── api/                                  # NestJS
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── company/
│   │       │   │   ├── domain/
│   │       │   │   │   ├── company.entity.ts
│   │       │   │   │   ├── company-status.vo.ts
│   │       │   │   │   └── errors/
│   │       │   │   ├── application/
│   │       │   │   │   ├── use-cases/
│   │       │   │   │   │   ├── register-company.use-case.ts
│   │       │   │   │   │   ├── suspend-company.use-case.ts
│   │       │   │   │   │   └── reactivate-company.use-case.ts
│   │       │   │   │   └── ports/
│   │       │   │   │       └── company-repository.port.ts
│   │       │   │   ├── infra/
│   │       │   │   │   └── persistence/prisma-company.repository.ts
│   │       │   │   ├── company.controller.ts        # Container
│   │       │   │   └── company.module.ts             # Container
│   │       │   ├── worker/                            # mesma estrutura de company/
│   │       │   ├── job-posting/                        # mesma estrutura
│   │       │   ├── moderation/                          # mesma estrutura
│   │       │   ├── credit/                               # mesma estrutura
│   │       │   ├── payment/
│   │       │   │   ├── domain/
│   │       │   │   │   ├── payment.entity.ts
│   │       │   │   │   └── credit-package.entity.ts
│   │       │   │   ├── application/
│   │       │   │   │   ├── use-cases/
│   │       │   │   │   │   ├── create-pix-charge.use-case.ts
│   │       │   │   │   │   ├── confirm-payment.use-case.ts
│   │       │   │   │   │   ├── expire-pending-payments.use-case.ts
│   │       │   │   │   │   └── reconcile-payments.use-case.ts
│   │       │   │   │   └── ports/
│   │       │   │   │       ├── payment-repository.port.ts
│   │       │   │   │       ├── credit-package-repository.port.ts
│   │       │   │   │       └── pix-payment-gateway.port.ts
│   │       │   │   ├── infra/
│   │       │   │   │   ├── persistence/prisma-payment.repository.ts
│   │       │   │   │   ├── pix/
│   │       │   │   │   │   ├── banco-inter-auth.service.ts     # OAuth2 + mTLS
│   │       │   │   │   │   └── banco-inter-pix.gateway.ts      # implementa PixPaymentGateway
│   │       │   │   │   └── jobs/
│   │       │   │   │       ├── expire-pending-payments.job.ts
│   │       │   │   │       └── reconcile-payments.job.ts
│   │       │   │   ├── payment-webhook.controller.ts   # recebe webhook do Banco Inter
│   │       │   │   ├── payment.controller.ts
│   │       │   │   └── payment.module.ts
│   │       │   ├── job-unlock/                          # mesma estrutura
│   │       │   └── admin/                                # mesma estrutura
│   │       ├── shared-kernel/
│   │       │   └── domain/                    # CNPJ, CPF, Email, Money, CreditAmount...
│   │       ├── infra/
│   │       │   └── prisma/
│   │       │       ├── prisma.service.ts
│   │       │       └── prisma-unit-of-work.ts  # implementa UnitOfWork
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── web/                                   # Next.js
│       └── src/
│           ├── app/
│           │   ├── (public)/vagas/
│           │   ├── (worker)/painel/
│           │   ├── (company)/empresa/
│           │   └── (admin)/admin/
│           └── lib/
│               └── api-client/                # cliente HTTP tipado para a API
├── packages/
│   ├── shared-types/                          # DTOs/contratos compartilhados api <-> web
│   └── config/                                # eslint/tsconfig compartilhados
├── prisma/
│   └── schema.prisma
├── docs/
├── package.json
└── pnpm-workspace.yaml
```

Cada módulo replica a mesma estrutura interna (`domain/ application/ infra/`), o que torna o mapa de dependências entre módulos (documento 2, seção 11) fácil de auditar: basta olhar quais `ports` de outros módulos aparecem nos `use-cases` de um módulo.

## 4. Integração Pix — Banco Inter

Sem gateway terceirizado: a API de Pix do Banco Inter exige **OAuth2 (client credentials)** combinado com **mTLS** (certificado cliente emitido no Internet Banking / portal de desenvolvedores do Inter). Toda a complexidade fica isolada em `apps/api/src/modules/payment/infra/pix/`.

### 4.1 Autenticação (`BancoInterAuthService`)
- Mantém um `https.Agent` configurado com o certificado e a chave privada (mTLS) — o mesmo agente é usado tanto para obter o token OAuth2 quanto para chamar os endpoints de Pix.
- `POST /oauth/v2/token` (client_credentials) com `client_id`/`client_secret` + escopos necessários (`cob.write`, `cob.read`, `webhook.write`, `webhook.read`, `pix.read`).
- Cacheia o access token em memória e renova antes da expiração (tokens do Inter duram ~1h). Se uma chamada retornar 401, força renovação e tenta novamente uma vez.

### 4.2 Criação de cobrança (`BancoInterPixGateway.createCharge`)
- Implementa a porta `PixPaymentGateway` (documento 2, seção 7).
- `PUT /pix/v2/cob/{txid}` (cobrança imediata) com `valor`, `chave` (chave Pix cadastrada da EteronHub), `expiracao` e `solicitacaoPagador`. O `txid` é gerado pela nossa aplicação (não pelo Inter) a partir do `PaymentId`, o que evita uma chamada extra e facilita correlação.
- A resposta contém o payload `pixCopiaECola`; o QR code (imagem) é gerado **localmente** a partir desse payload (biblioteca de QR code), sem chamada adicional ao Inter.

### 4.3 Webhook (`payment-webhook.controller.ts`)
- Endpoint público `POST /webhooks/banco-inter/pix`, registrado uma única vez via setup administrativo (`PUT /pix/v2/webhook/{chave}` na API do Inter), fora do fluxo de requisição normal.
- O Inter envia um array de eventos `pix` recebidos, cada um com `txid`, `endToEndId` e `valor`.
- Validação de origem: a chamada chega apenas pela mesma conexão mTLS configurada no lado do Inter (certificado do webhook); adicionalmente, o handler ignora qualquer evento cujo `txid` não corresponda a um `Payment` conhecido.
- Para cada evento, o controller **apenas traduz o payload** e delega para `ConfirmPaymentUseCase.execute({ pixTxId, e2eId })` (Application) — nenhuma regra de negócio vive no controller.
- `ConfirmPaymentUseCase` é idempotente (documento 2, seção 7, regra 17): se o `Payment` já está `CONFIRMED`, a segunda notificação do mesmo evento é um no-op. Isso cobre o caso comum de o Inter reenviar a mesma notificação por falta de ACK a tempo.

### 4.4 Job de reconciliação (`reconcile-payments.job.ts`)
- `@Cron` a cada poucos minutos.
- Busca (`PaymentRepository.findPendingOlderThan`) pagamentos ainda `PENDING` com mais de N minutos.
- Para cada um, chama `PixPaymentGateway.getChargeStatus(pixTxId)`. Se o status retornado pelo Inter for `CONCLUIDA`, chama `ConfirmPaymentUseCase` do mesmo jeito que o webhook chamaria.
- Isso torna o fluxo de créditos resiliente a falhas de entrega do webhook (rede, timeout, deploy no meio da notificação) sem exigir nenhuma ação do trabalhador.

### 4.5 Job de expiração (`expire-pending-payments.job.ts`)
- `@Cron`, busca `Payment`s `PENDING` com `expiresAt` no passado e chama `ExpirePendingPaymentsUseCase` (regra 19 do documento 1).

## 5. Contratos de API

Convenções gerais:
- Todas as rotas autenticadas usam `Authorization: Bearer <jwt>`.
- Vagas anonimizadas nunca incluem `companyId`, razão social ou `contactInfo` no payload de resposta — a anonimização (documento 2, seção 4, `toAnonymizedView()`) acontece no Application, então não há risco de o controller "esquecer" de esconder um campo sensível.
- Erros de domínio são mapeados para status HTTP no Container (ex.: `InsufficientCreditsError` → `402 Payment Required`; erro de transição de estado inválida em `JobPosting` → `409 Conflict`; entidade não encontrada → `404`).

### Público
| Método | Rota | Descrição |
|---|---|---|
| POST | `/companies` | Cadastro de empresa (CNPJ). |
| POST | `/workers` | Cadastro de trabalhador (CPF). |
| POST | `/auth/login` | Login de empresa ou trabalhador, retorna JWT. |
| GET | `/job-postings` | Lista vagas publicadas, anonimizadas, com filtros (localização, faixa salarial). |
| GET | `/job-postings/:id` | Detalhe de uma vaga — anonimizado, ou completo se o trabalhador autenticado já a desbloqueou. |
| GET | `/credit-packages` | Catálogo de pacotes de créditos disponíveis. |

### Empresa (JWT de empresa)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/companies/me/job-postings` | Cria vaga em `DRAFT`. |
| PATCH | `/companies/me/job-postings/:id` | Edita vaga em `DRAFT`. |
| POST | `/companies/me/job-postings/:id/submit` | Submete para moderação. |
| POST | `/companies/me/job-postings/:id/close` | Encerra vaga publicada. |
| GET | `/companies/me/job-postings` | Lista vagas da própria empresa, em qualquer status. |

### Trabalhador (JWT de trabalhador)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/workers/me/credit-wallet` | Saldo atual de créditos. |
| POST | `/workers/me/payments` | Cria cobrança Pix para um pacote de créditos (retorna `pixCopiaECola` + QR code). |
| GET | `/workers/me/payments/:id` | Status do pagamento (para a página de checkout fazer polling até `CONFIRMED`). |
| POST | `/workers/me/job-postings/:id/unlock` | Desbloqueia a vaga (idempotente — repetir a chamada após sucesso não cobra de novo). |
| GET | `/workers/me/job-unlocks` | Histórico de vagas desbloqueadas. |

### Admin (sessão de admin)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/admin/auth/login` | Login de admin, retorna JWT (sessão separada da de empresa/trabalhador). |
| GET | `/admin/me` | Perfil do admin autenticado. |
| GET | `/admin/moderation/pending` | Lista vagas em `IN_MODERATION`. |
| POST | `/admin/moderation/:jobPostingId/approve` | Aprova e publica a vaga. |
| POST | `/admin/moderation/:jobPostingId/reject` | Rejeita a vaga (`reason` obrigatório no body). |
| POST | `/admin/companies/:id/suspend` / `/reactivate` | Suspende/reativa empresa. |
| POST | `/admin/workers/:id/suspend` / `/reactivate` | Suspende/reativa trabalhador. |

### Integração externa (Banco Inter → EteronHub)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/webhooks/banco-inter/pix` | Notificação de Pix recebido. Não é chamada pelo frontend; documentada aqui por ser parte do contrato de API do sistema. |
