# Eteron Hub — Modelo de Domínio

Este documento define as entidades, value objects, agregados e casos de uso que compõem
as camadas **Domain** e **Application** da Clean Architecture, organizados por bounded
context (módulo).

Convenções:
- **Entity**: possui identidade (id) e ciclo de vida.
- **Value Object (VO)**: imutável, comparado por valor, autovalida invariantes na
  construção (lança erro de domínio se inválido).
- **Aggregate Root**: entidade que garante consistência transacional do seu cluster.
- Toda entidade/VO fica em `domain/`, livre de qualquer dependência de framework,
  banco ou HTTP.

---

## 1. Módulo `company` (Empresa)

### Entidade: `Company` (Aggregate Root)
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | |
| corporateName (razão social) | string | |
| tradeName (nome fantasia) | string | opcional |
| cnpj | VO `Cnpj` | único |
| email | VO `Email` | único |
| phone | VO `PhoneNumber` | |
| contactName | string | responsável pelo contato |
| status | enum `CompanyStatus` | `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED` |
| passwordHash | string | |
| createdAt / updatedAt | Date | |

Invariantes: CNPJ válido (dígito verificador), e-mail com formato válido, empresa
`SUSPENDED` não pode publicar novas vagas.

### Value Objects
- `Cnpj`: valida formato e dígitos verificadores.
- `Email`, `PhoneNumber`, `Money` (ver seção compartilhada abaixo).

### Casos de Uso (Application)
- `RegisterCompanyUseCase`
- `AuthenticateCompanyUseCase`
- `UpdateCompanyProfileUseCase`
- `GetCompanyProfileUseCase`

### Porta (Repository interface)
- `CompanyRepository`: `save`, `findById`, `findByCnpj`, `findByEmail`, `existsByCnpj`

---

## 2. Módulo `worker` (Trabalhador)

### Entidade: `Worker` (Aggregate Root)
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | |
| fullName | string | |
| cpf | VO `Cpf` | único |
| email | VO `Email` | único |
| phone | VO `PhoneNumber` | |
| category (função principal) | VO `WorkerCategory` | ex.: soldador, caldeireiro |
| passwordHash | string | |
| createdAt / updatedAt | Date | |

Invariantes: CPF válido (dígito verificador).

### Casos de Uso
- `RegisterWorkerUseCase`
- `AuthenticateWorkerUseCase`
- `UpdateWorkerProfileUseCase`

### Porta
- `WorkerRepository`: `save`, `findById`, `findByCpf`, `findByEmail`

---

## 3. Módulo `job-posting` (Vaga)

### Entidade: `JobPosting` (Aggregate Root)
| Campo | Tipo | Observação |
|---|---|---|
| id | UUID | |
| companyId | UUID | referência à empresa dona |
| title | string | |
| description | string | |
| category | VO `JobCategory` | função/especialidade |
| contractType | enum | `CLT`, `PJ`, `TEMPORARY`, `FREELANCE` |
| location | VO `Location` (city, state) | |
| salaryRange | VO `SalaryRange` | opcional (min/max) |
| unlockCost | VO `CreditAmount` | custo em créditos para desbloqueio |
| status | enum `JobPostingStatus` | ver abaixo |
| moderatedBy | UUID (admin) | opcional |
| moderationReason | string | opcional (motivo de rejeição/suspensão) |
| publishedAt / expiresAt / createdAt / updatedAt | Date | |

`JobPostingStatus`: `DRAFT` → `PENDING_MODERATION` → `APPROVED` | `REJECTED`;
`APPROVED` → `SUSPENDED` | `EXPIRED` | `CLOSED`.

Regras de transição de estado vivem **dentro da entidade** (métodos como
`submitForModeration()`, `approve(adminId)`, `reject(adminId, reason)`,
`suspend(adminId, reason)`, `close()`, `expire()`), lançando erro de domínio se a
transição não for permitida a partir do estado atual.

### Projeção pública (anonimizada)
`PublicJobPostingView` (DTO de saída, não entidade): title, description, category,
contractType, location, salaryRange, unlockCost, publishedAt — **sem** companyId
exposto de forma identificável (usa um `jobPostingId` opaco).

### Casos de Uso
- `CreateJobPostingUseCase` (empresa)
- `SubmitJobPostingForModerationUseCase`
- `ListMyJobPostingsUseCase` (empresa vê status de todas as suas vagas)
- `ListPublicJobPostingsUseCase` (trabalhador, filtros: categoria, cidade/UF)
- `GetPublicJobPostingDetailsUseCase`
- `CloseJobPostingUseCase` (empresa)
- `ExpireStaleJobPostingsUseCase` (job agendado)
- **Admin**: `ListPendingModerationUseCase`, `ApproveJobPostingUseCase`,
  `RejectJobPostingUseCase`, `SuspendJobPostingUseCase`

### Porta
- `JobPostingRepository`

---

## 4. Módulo `moderation` (Auditoria)

### Entidade: `ModerationLog`
| Campo | Tipo |
|---|---|
| id | UUID |
| jobPostingId | UUID |
| adminId | UUID |
| decision | enum `APPROVED`, `REJECTED`, `SUSPENDED` |
| reason | string (opcional para aprovação, obrigatório para rejeição/suspensão) |
| createdAt | Date |

Registro **append-only** (nunca editado/apagado) — é o log de auditoria.

### Porta
- `ModerationLogRepository`: `save`, `listByJobPosting`

---

## 5. Módulo `credit` (Créditos e Carteira)

### Entidade: `CreditWallet` (Aggregate Root)
| Campo | Tipo |
|---|---|
| id | UUID |
| workerId | UUID (único — 1 carteira por trabalhador) |
| balance | VO `CreditAmount` |
| updatedAt | Date |

Regras dentro da entidade: `credit(amount)`, `debit(amount)` (lança
`InsufficientCreditsError` se `amount > balance`). Toda alteração de saldo só acontece
através desses métodos — nunca escrita direta.

### Entidade: `CreditTransaction` (registro imutável / extrato)
| Campo | Tipo |
|---|---|
| id | UUID |
| walletId | UUID |
| type | enum `PURCHASE`, `CONSUMPTION`, `REFUND` |
| amount | VO `CreditAmount` |
| relatedEntityId | UUID | (pixChargeId ou jobUnlockId, conforme o tipo) |
| createdAt | Date |

### Entidade: `CreditPackage` (catálogo, gerenciado pelo admin)
| Campo | Tipo |
|---|---|
| id | UUID |
| name | string |
| creditsAmount | VO `CreditAmount` |
| price | VO `Money` |
| active | boolean |

### Casos de Uso
- `GetWalletBalanceUseCase`
- `ListCreditTransactionsUseCase`
- `ListCreditPackagesUseCase`
- **Admin**: `CreateCreditPackageUseCase`, `UpdateCreditPackageUseCase`,
  `DeactivateCreditPackageUseCase`

### Portas
- `CreditWalletRepository`, `CreditTransactionRepository`, `CreditPackageRepository`

---

## 6. Módulo `payment` (Pix / Banco Inter)

### Entidade: `PixCharge` (Aggregate Root)
| Campo | Tipo |
|---|---|
| id | UUID (interno) |
| workerId | UUID |
| creditPackageId | UUID |
| amount | VO `Money` |
| creditsToGrant | VO `CreditAmount` |
| externalTxId | string | txid retornado pelo Banco Inter |
| qrCodeImage | string (base64) | |
| qrCodeCopyPaste | string (payload EMV) | |
| status | enum `PENDING`, `PAID`, `EXPIRED`, `FAILED` |
| expiresAt | Date | |
| paidAt | Date | opcional |
| createdAt | Date | |

Métodos de domínio: `markAsPaid()`, `markAsExpired()` — validam transição a partir de
`PENDING` apenas.

### Casos de Uso
- `PurchaseCreditPackageUseCase`: cria `PixCharge` via `PixPaymentGateway` (porta) e
  persiste.
- `ConfirmPixPaymentUseCase`: chamado pelo webhook handler; **idempotente** via
  `externalTxId` (se já processado, no-op); ao confirmar, credita a `CreditWallet`
  correspondente e cria `CreditTransaction` do tipo `PURCHASE` — tudo em uma única
  transação de banco.
- `ExpirePendingPixChargesUseCase` (job agendado)

### Porta (chave para a Clean Architecture)
- `PixPaymentGateway` (interface no Domain/Application):
  ```ts
  interface PixPaymentGateway {
    createCharge(input: CreatePixChargeInput): Promise<PixChargeCreated>;
    getChargeStatus(externalTxId: string): Promise<PixChargeStatus>;
  }
  ```
  Implementação concreta na Infra: `BancoInterPixGateway`, que fala com a API do Banco
  Inter (OAuth2 mTLS, endpoint de cobrança imediata via Pix, etc.). Por decisão do
  projeto a integração é direta com o Banco Inter (sem gateway terceirizado), mas por
  estar isolada atrás de uma porta, uma futura troca/adjunção de provedor não impacta
  Domain nem Application.
- `PixWebhookVerifier` (porta): valida assinatura/autenticidade do callback recebido do
  Banco Inter antes de processar.

### Portas de persistência
- `PixChargeRepository`: `save`, `findByExternalTxId`, `findPendingOlderThan`

---

## 7. Módulo `job-unlock` (Desbloqueio)

### Entidade: `JobUnlock`
| Campo | Tipo |
|---|---|
| id | UUID |
| jobPostingId | UUID |
| workerId | UUID |
| creditsSpent | VO `CreditAmount` |
| unlockedAt | Date |

Restrição de unicidade: par (`jobPostingId`, `workerId`) é único — garante
idempotência do RN-23.

### Caso de Uso principal: `UnlockJobPostingUseCase`
Orquestra (dentro de uma transação):
1. Verifica se já existe `JobUnlock` para o par (worker, vaga) → se existir, retorna os
   dados de contato sem cobrar novamente.
2. Busca `JobPosting` (deve estar `APPROVED`) e seu `unlockCost`.
3. Busca `CreditWallet` do worker e chama `wallet.debit(unlockCost)` — lança erro de
   domínio `InsufficientCreditsError` se saldo insuficiente (caso de uso captura e
   retorna falha de negócio, não exceção HTTP).
4. Persiste `CreditTransaction` tipo `CONSUMPTION`.
5. Cria e persiste `JobUnlock`.
6. Retorna `CompanyContactView` (dados de contato completos da empresa dona da vaga).

### Casos de Uso adicionais
- `ListMyUnlockedJobsUseCase` (histórico do trabalhador)

### Porta
- `JobUnlockRepository`: `save`, `findByWorkerAndJobPosting`, `listByWorker`

---

## 8. Módulo `platform-settings` (Configuração)

### Entidade: `PlatformSetting` (chave/valor tipado, gerenciado pelo admin)
Exemplos: `defaultUnlockCost`, `jobPostingExpirationDays`, `pixChargeExpirationMinutes`.

---

## 9. Módulo `admin`

### Entidade: `Admin`
| Campo | Tipo |
|---|---|
| id | UUID |
| name | string |
| email | VO `Email` |
| passwordHash | string |
| role | enum `MODERATOR`, `SUPER_ADMIN` |

### Casos de Uso (dashboard/métricas)
- `GetModerationQueueMetricsUseCase`
- `GetRevenueMetricsUseCase` (receita de créditos por período)
- `GetUnlockConversionMetricsUseCase`

---

## 10. Value Objects Compartilhados (`shared/domain`)

| VO | Regras |
|---|---|
| `Cnpj` | 14 dígitos, valida dígito verificador |
| `Cpf` | 11 dígitos, valida dígito verificador |
| `Email` | regex RFC-simplificada |
| `PhoneNumber` | formato BR (DDD + número), normaliza para E.164 |
| `Money` | armazenado em **centavos** (inteiro), nunca float; operações `add`, `subtract`, `isGreaterThan` |
| `CreditAmount` | inteiro não-negativo; operações `add`, `subtract`, `isGreaterThan` |
| `Location` | `{ city: string; state: UF }`, valida UF contra lista fechada de 27 estados |
| `SalaryRange` | `{ min?: Money; max?: Money }`, valida `min <= max` quando ambos presentes |
| `JobCategory` | enum fechado (ex.: `WELDER`, `BOILERMAKER`, `STRUCTURAL_FITTER`, `LOCKSMITH`, `SAFETY_TECHNICIAN`, `DESIGNER`, `OTHER`) |

## 11. Erros de Domínio (exemplos)
- `InvalidCnpjError`, `InvalidCpfError`
- `DuplicateCnpjError`, `DuplicateCpfError`
- `InvalidJobPostingTransitionError`
- `InsufficientCreditsError`
- `JobPostingNotApprovedError`
- `PixChargeAlreadyProcessedError`
- `PixChargeExpiredError`

Todos estendem uma classe base `DomainError` (não HTTP-aware); o mapeamento para
status HTTP acontece na camada de Infra/Container (ex.: `ExceptionFilter` do NestJS).
