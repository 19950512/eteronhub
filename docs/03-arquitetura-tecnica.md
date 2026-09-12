# Eteron Hub — Arquitetura Técnica

## 1. Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + **NestJS** (TypeScript) |
| Frontend (web público: empresa + trabalhador + admin) | **Next.js** (React, TypeScript) |
| Banco de dados | PostgreSQL |
| ORM | Prisma |
| Autenticação | JWT (access + refresh token), guards por role (`COMPANY`, `WORKER`, `ADMIN`) |
| Fila/Jobs agendados | `@nestjs/schedule` (cron) para expiração de vagas e cobranças Pix; considerar BullMQ + Redis se o volume de jobs assíncronos crescer |
| Pagamento | API do Banco Inter (Pix — cobrança imediata + webhook de confirmação), integração direta via porta `PixPaymentGateway` |
| Infra/Deploy | Docker + docker-compose para dev; a definir provedor de hospedagem (Railway/AWS/Fly.io) |
| Testes | Jest (unit — Domain/Application isolados de framework; integração — casos de uso com repositórios reais/testcontainers) |

Justificativa do NestJS: seu módulo de DI nativo mapeia quase 1:1 para a camada
**Container** da Clean Architecture (cada `*.module.ts` é o ponto onde interfaces de
domínio são amarradas às implementações de infra via `providers`).

## 2. Camadas (Clean Architecture)

```
┌─────────────────────────────────────────────────────────┐
│ Container (NestJS Modules)                               │
│  - Wiring de DI: liga portas (interfaces) às implementações│
│  - Controllers HTTP, Guards, Pipes, Filters                │
├─────────────────────────────────────────────────────────┤
│ Infra                                                     │
│  - Persistência (Prisma repositories)                    │
│  - Gateways externos (BancoInterPixGateway)               │
│  - Serviços técnicos (JwtTokenService, BcryptHasher)      │
├─────────────────────────────────────────────────────────┤
│ Application                                               │
│  - Use Cases (orquestram Domain + Portas)                 │
│  - DTOs de entrada/saída                                  │
├─────────────────────────────────────────────────────────┤
│ Domain                                                    │
│  - Entities, Value Objects, Aggregate Roots               │
│  - Regras de negócio e invariantes                        │
│  - Interfaces de repositório/gateway (portas)              │
│  - Erros de domínio                                        │
│  - ZERO dependência de framework, HTTP ou banco            │
└─────────────────────────────────────────────────────────┘
```

Regra de dependência: **as setas de import só apontam para dentro.** Domain não conhece
Application; Application não conhece Infra nem Container; Infra implementa interfaces
definidas no Domain/Application; Container conhece todo mundo (é o único lugar
permitido a fazer o "new" das implementações concretas e injetá-las).

## 3. Estrutura de Pastas Proposta (monorepo)

```
eteronhub/
├── apps/
│   ├── api/                              # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── company/
│   │   │   │   │   ├── domain/
│   │   │   │   │   │   ├── entities/company.entity.ts
│   │   │   │   │   │   ├── value-objects/cnpj.vo.ts
│   │   │   │   │   │   ├── repositories/company.repository.ts   (interface/porta)
│   │   │   │   │   │   └── errors/
│   │   │   │   │   ├── application/
│   │   │   │   │   │   ├── use-cases/register-company.use-case.ts
│   │   │   │   │   │   └── dtos/
│   │   │   │   │   ├── infra/
│   │   │   │   │   │   ├── persistence/prisma-company.repository.ts
│   │   │   │   │   │   ├── http/company.controller.ts
│   │   │   │   │   │   └── mappers/company.mapper.ts
│   │   │   │   │   └── company.module.ts                        (Container)
│   │   │   │   ├── worker/            (mesma estrutura)
│   │   │   │   ├── job-posting/       (mesma estrutura)
│   │   │   │   ├── moderation/        (mesma estrutura)
│   │   │   │   ├── credit/            (mesma estrutura)
│   │   │   │   ├── job-unlock/        (mesma estrutura)
│   │   │   │   ├── payment/
│   │   │   │   │   ├── domain/repositories/pix-charge.repository.ts
│   │   │   │   │   ├── domain/gateways/pix-payment.gateway.ts    (porta)
│   │   │   │   │   ├── application/use-cases/
│   │   │   │   │   ├── infra/gateways/banco-inter/
│   │   │   │   │   │   ├── banco-inter-pix.gateway.ts
│   │   │   │   │   │   ├── banco-inter-auth.client.ts  (OAuth2 + mTLS)
│   │   │   │   │   │   └── banco-inter-webhook.controller.ts
│   │   │   │   │   └── payment.module.ts
│   │   │   │   ├── auth/              (login, JWT, guards por role)
│   │   │   │   ├── admin/             (dashboard, métricas)
│   │   │   │   └── platform-settings/
│   │   │   ├── shared/
│   │   │   │   ├── domain/            (Entity, ValueObject, AggregateRoot base classes)
│   │   │   │   ├── application/       (UseCase<Input, Output> interface, Result/Either)
│   │   │   │   └── infra/             (PrismaModule, LoggerModule, ConfigModule, filters globais)
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/schema.prisma
│   │   └── test/
│   └── web/                               # Next.js (empresa + trabalhador + admin)
│       └── src/
│           ├── app/
│           │   ├── (public)/vagas/            # listagem/detalhe de vagas (anonimizado)
│           │   ├── (empresa)/empresa/         # cadastro, dashboard, minhas vagas
│           │   ├── (trabalhador)/trabalhador/ # cadastro, carteira, vagas desbloqueadas
│           │   └── (admin)/admin/             # moderação, financeiro, configurações
│           ├── components/
│           ├── lib/api-client/                # client tipado consumindo a API NestJS
│           └── ...
├── docs/
├── docker-compose.yml
└── README.md
```

Observação: `web` concentra as três áreas (empresa/trabalhador/admin) com rotas
protegidas por papel — reduz complexidade operacional do MVP frente a 3 apps
separados. Pode ser splitado depois se o admin crescer muito.

## 4. Container: exemplo de módulo NestJS

```ts
// modules/job-unlock/job-unlock.module.ts
@Module({
  imports: [PrismaModule, CreditModule, JobPostingModule],
  controllers: [JobUnlockController],
  providers: [
    UnlockJobPostingUseCase,
    { provide: JOB_UNLOCK_REPOSITORY, useClass: PrismaJobUnlockRepository },
  ],
  exports: [UnlockJobPostingUseCase],
})
export class JobUnlockModule {}
```

Portas usam **injection tokens** (`Symbol` ou `InjectionToken`) para não vazar
dependência do NestJS para dentro do Domain — a interface do repositório continua um
`interface` TypeScript puro em `domain/repositories/`.

## 5. Integração Banco Inter (Pix) — detalhes técnicos

- Autenticação: OAuth2 client credentials + certificado mTLS (exigido pela API do
  Banco Inter) — client dedicado (`BancoInterAuthClient`) cuida de obter/renovar token.
- Criação de cobrança: endpoint de **Pix cobrança imediata**, retorna `txid`, payload
  EMV (copia e cola) e imagem do QR Code (base64).
- Confirmação: Banco Inter envia **webhook** para uma URL pública configurada
  previamente no dia a dia da conta — endpoint dedicado
  (`POST /webhooks/banco-inter/pix`), fora de guards de JWT (autenticidade validada por
  outro mecanismo: IP allowlist e/ou validação de payload conforme doc do banco).
- Idempotência: `ConfirmPixPaymentUseCase` busca `PixCharge` por `externalTxId`; se
  `status !== PENDING`, retorna sem reprocessar.
- Fallback: job agendado (`GetChargeStatus` via API, não só webhook) para reconciliar
  cobranças que ficaram `PENDING` além do esperado — evita depender 100% da entrega do
  webhook.
- Segredos (certificado, client id/secret) via variáveis de ambiente / secret manager,
  nunca commitados.

## 6. Contratos de API (REST) — visão geral dos principais endpoints

### Auth
- `POST /auth/company/register`
- `POST /auth/company/login`
- `POST /auth/worker/register`
- `POST /auth/worker/login`
- `POST /auth/admin/login`
- `POST /auth/refresh`

### Empresa
- `GET /companies/me`
- `PATCH /companies/me`
- `POST /job-postings` (cria em `DRAFT`)
- `PATCH /job-postings/:id`
- `POST /job-postings/:id/submit` (envia para moderação)
- `POST /job-postings/:id/close`
- `GET /job-postings/me` (todas as vagas da empresa logada, com status)

### Trabalhador
- `GET /job-postings/public` (listagem anonimizada, filtros: categoria, cidade, UF)
- `GET /job-postings/public/:id`
- `GET /wallet/me`
- `GET /wallet/me/transactions`
- `GET /credit-packages`
- `POST /credit-packages/:id/purchase` → cria `PixCharge`, retorna QR Code
- `GET /pix-charges/:id/status` (polling opcional além do webhook)
- `POST /job-postings/:id/unlock` → retorna dados de contato da empresa
- `GET /job-unlocks/me`

### Webhook (público, sem JWT)
- `POST /webhooks/banco-inter/pix`

### Admin
- `GET /admin/moderation-queue`
- `POST /admin/job-postings/:id/approve`
- `POST /admin/job-postings/:id/reject` `{ reason }`
- `POST /admin/job-postings/:id/suspend` `{ reason }`
- `GET /admin/companies`
- `POST /admin/companies/:id/suspend`
- `GET /admin/credit-packages` / `POST` / `PATCH`
- `GET /admin/metrics/revenue`
- `GET /admin/metrics/moderation`
- `GET /admin/metrics/unlock-conversion`

## 7. Requisitos Não-Funcionais
- **LGPD**: CPF/CNPJ e dados de contato são dados pessoais/sensíveis — criptografia em
  trânsito (HTTPS obrigatório), controle de acesso rígido (dados de empresa só
  aparecem completos após unlock pago; nunca logar CPF/CNPJ em plaintext em logs de
  aplicação).
- **Auditoria**: toda decisão de moderação e toda transação financeira é imutável
  (append-only).
- **Consistência financeira**: confirmação de pagamento e débito de créditos sempre
  dentro de transação de banco (Prisma `$transaction`), nunca em duas escritas
  separadas sem lock.
- **Observabilidade**: logs estruturados (JSON), correlação por request-id;
  monitoramento de falhas de webhook do Banco Inter (alerta se taxa de erro subir).
- **Escalabilidade**: stateless na API (sessões via JWT, não sticky session) para
  permitir múltiplas instâncias atrás de um load balancer.
