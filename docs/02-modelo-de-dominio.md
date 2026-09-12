# Modelo de Domínio — EteronHub

Este documento detalha o modelo de domínio derivado das regras descritas em [01-produto-e-regras-de-negocio.md](01-produto-e-regras-de-negocio.md), organizado por módulo (bounded context). Cada módulo lista suas **entidades**, **value objects**, o **agregado raiz**, os **casos de uso** (application services) e as **portas** (interfaces que o Domain/Application definem e a Infra implementa).

Convenção: portas são descritas como interfaces TypeScript, pois a stack é NestJS (ver [03-arquitetura-tecnica.md](03-arquitetura-tecnica.md)). Nomes de métodos usam `Promise` porque toda porta de persistência/integração é assíncrona.

## 1. Value objects compartilhados

Vivem em um módulo `shared-kernel` (ou `common`), usados por mais de um módulo.

| Value Object | Descrição | Invariantes |
|---|---|---|
| `CNPJ` | CNPJ de uma empresa. | 14 dígitos, dígitos verificadores válidos. Imutável. |
| `CPF` | CPF de um trabalhador. | 11 dígitos, dígitos verificadores válidos. Imutável. |
| `Email` | Endereço de e-mail. | Formato válido, normalizado em lowercase. |
| `Money` | Valor monetário em BRL. | Armazenado em centavos (inteiro), nunca negativo para preços de pacotes/pagamentos. |
| `CreditAmount` | Quantidade de créditos. | Inteiro não-negativo (créditos não são fracionários). Suporta `add`, `subtract` (lança erro de domínio se o resultado for negativo). |
| `DateRange` / `ExpiresAt` | Data de expiração. | Sempre no futuro no momento da criação. |

Cada módulo abaixo também define seus próprios *ids* fortemente tipados (ex.: `CompanyId`, `WorkerId`, `JobPostingId`) como wrappers de UUID, para evitar troca acidental de identificadores entre entidades diferentes.

## 2. Módulo `company`

### Entidades
- **Company** (agregado raiz) — `id: CompanyId`, `cnpj: CNPJ`, `razaoSocial: string`, `nomeFantasia?: string`, `email: Email`, `status: CompanyStatus`, `createdAt: Date`.

### Value objects
- `CompanyId`
- `CompanyStatus` = `ACTIVE | SUSPENDED`

### Agregado
`Company` é o único agregado do módulo. Regras de negócio 1 e 23 são garantidas aqui: unicidade de CNPJ (garantida na camada de aplicação/porta via `existsByCnpj`, com constraint única no banco como segunda linha de defesa) e transição de status.

Métodos de domínio: `suspend()`, `reactivate()` — validam transições de estado (não suspender quem já está suspenso, etc.).

### Casos de uso
- `RegisterCompanyUseCase` — valida CNPJ, checa duplicidade, cria `Company`.
- `SuspendCompanyUseCase` (acionado pelo módulo `admin`) — regra 23.
- `ReactivateCompanyUseCase`.

### Portas
```typescript
interface CompanyRepository {
  save(company: Company): Promise<void>;
  findById(id: CompanyId): Promise<Company | null>;
  findByCnpj(cnpj: CNPJ): Promise<Company | null>;
  existsByCnpj(cnpj: CNPJ): Promise<boolean>;
}
```

## 3. Módulo `worker`

### Entidades
- **Worker** (agregado raiz) — `id: WorkerId`, `cpf: CPF`, `nome: string`, `email: Email`, `status: WorkerStatus`, `createdAt: Date`.

### Value objects
- `WorkerId`
- `WorkerStatus` = `ACTIVE | SUSPENDED`

### Agregado
`Worker` guarda apenas identidade, dados pessoais e status — **não** guarda saldo de créditos (isso é responsabilidade do módulo `credit`, que referencia `WorkerId`). Essa separação evita que o agregado `Worker` cresça para acomodar regras de concorrência sobre saldo, que têm uma cadência de mudança muito maior.

### Casos de uso
- `RegisterWorkerUseCase` — valida CPF, checa duplicidade, cria `Worker`.
- `SuspendWorkerUseCase` (regra 24).
- `ReactivateWorkerUseCase`.

### Portas
```typescript
interface WorkerRepository {
  save(worker: Worker): Promise<void>;
  findById(id: WorkerId): Promise<Worker | null>;
  findByCpf(cpf: CPF): Promise<Worker | null>;
  existsByCpf(cpf: CPF): Promise<boolean>;
}
```

## 4. Módulo `job-posting`

### Entidades
- **JobPosting** (agregado raiz) — `id: JobPostingId`, `companyId: CompanyId`, `title: string`, `description: string`, `requirements: string`, `salaryRange: SalaryRange`, `location: string`, `contactInfo: ContactInfo`, `unlockCost: CreditAmount`, `status: JobPostingStatus`, `rejectionReason?: string`, `publishedAt?: Date`, `expiresAt?: Date`, `createdAt: Date`.

### Value objects
- `JobPostingId`
- `SalaryRange` — `{ min: Money; max: Money }`, com `min <= max`.
- `ContactInfo` — dados de contato/aplicação revelados apenas após desbloqueio (e-mail, telefone, link de aplicação).
- `JobPostingStatus` = `DRAFT | IN_MODERATION | PUBLISHED | REJECTED | CLOSED | EXPIRED`

### Agregado
`JobPosting` concentra a máquina de estados das regras 3–10 e 21–22:

```
DRAFT --submitForModeration()--> IN_MODERATION
IN_MODERATION --approve()--> PUBLISHED
IN_MODERATION --reject(reason)--> REJECTED
REJECTED --resubmit()--> IN_MODERATION
PUBLISHED --close()--> CLOSED
PUBLISHED --expire()--> EXPIRED   (disparado por job agendado quando now() > expiresAt)
```

Cada transição inválida lança um erro de domínio (ex.: `approve()` chamado fora de `IN_MODERATION`).

O `unlockCost` é definido na criação/edição enquanto em `DRAFT`, e a entidade expõe `lockUnlockCost()` — uma vez que a vaga é aprovada e publicada, o custo não pode mais ser alterado (regra 10). Editar uma vaga já `PUBLISHED` (exceto fechá-la) está fora do escopo do MVP.

A entidade expõe duas projeções de leitura, usadas pela camada de apresentação:
- `toAnonymizedView()` — título, descrição, requisitos, faixa salarial, localização aproximada, custo de desbloqueio. **Nunca** inclui `companyId`/nome da empresa nem `contactInfo` (regra 9).
- `toFullView()` — inclui também a razão social da empresa (buscada via `CompanyRepository`) e `contactInfo`. Só deve ser chamada pelo caso de uso de detalhe de vaga quando já existe um `JobUnlock` para o par (worker, vaga) — ver módulo `job-unlock`.

### Casos de uso
- `CreateJobPostingUseCase`
- `SubmitJobPostingForModerationUseCase` (regras 3, 5)
- `CloseJobPostingUseCase` (regra 22)
- `ExpireJobPostingsUseCase` (job agendado, regra 21)
- `ListPublicJobPostingsUseCase` — retorna apenas `PUBLISHED` e não expiradas, via `toAnonymizedView()`.
- `GetJobPostingDetailsUseCase` — recebe `workerId` + `jobPostingId`; decide entre `toAnonymizedView()` e `toFullView()` consultando o módulo `job-unlock`.

### Portas
```typescript
interface JobPostingRepository {
  save(jobPosting: JobPosting): Promise<void>;
  findById(id: JobPostingId): Promise<JobPosting | null>;
  findPublished(filter: JobPostingFilter): Promise<JobPosting[]>;
  findExpiredPublished(now: Date): Promise<JobPosting[]>;
  findByCompany(companyId: CompanyId): Promise<JobPosting[]>;
}
```

## 5. Módulo `moderation`

### Entidades
- **ModerationDecision** (agregado raiz) — `id: ModerationDecisionId`, `jobPostingId: JobPostingId`, `adminId: AdminId`, `decision: 'APPROVED' | 'REJECTED'`, `reason?: string`, `decidedAt: Date`.

Registro de auditoria *append-only* (regra 25) — nunca é atualizado, apenas criado.

### Agregado
`ModerationDecision` é um agregado simples e imutável. A transição de estado da vaga em si é responsabilidade do agregado `JobPosting` (módulo `job-posting`); `moderation` apenas orquestra a decisão e grava o registro de auditoria.

### Casos de uso
- `ListPendingModerationUseCase` — lista vagas em `IN_MODERATION`.
- `ApproveJobPostingUseCase` — carrega `JobPosting`, chama `.approve()`, salva, grava `ModerationDecision('APPROVED')`. Transacional (ambas as escritas ocorrem juntas).
- `RejectJobPostingUseCase` — idem, com `.reject(reason)` e `ModerationDecision('REJECTED', reason)`. `reason` é obrigatório (regra 7).

### Portas
```typescript
interface ModerationDecisionRepository {
  save(decision: ModerationDecision): Promise<void>;
  findByJobPosting(jobPostingId: JobPostingId): Promise<ModerationDecision[]>;
}
```
(Depende também de `JobPostingRepository`, do módulo `job-posting`.)

## 6. Módulo `credit`

### Entidades
- **CreditWallet** (agregado raiz) — `id: CreditWalletId`, `workerId: WorkerId`, `balance: CreditAmount`, `updatedAt: Date`.
- **CreditTransaction** — `id: CreditTransactionId`, `walletId: CreditWalletId`, `type: 'TOPUP' | 'DEBIT'`, `amount: CreditAmount`, `relatedPaymentId?: PaymentId`, `relatedJobUnlockId?: JobUnlockId`, `createdAt: Date`. Ledger imutável, usado para auditoria e para reconstituir o saldo se necessário.

### Value objects
- `CreditWalletId`, `CreditTransactionId`

### Agregado
`CreditWallet` é o agregado raiz; toda alteração de saldo passa por ele:
- `credit(amount: CreditAmount)` — usado após confirmação de pagamento (regra 16).
- `debit(amount: CreditAmount)` — lança erro de domínio `InsufficientCreditsError` se `amount > balance` (regras 11, 20 — saldo nunca fica negativo).

Cada chamada a `credit`/`debit` deve ser acompanhada, na mesma transação de aplicação, da criação do `CreditTransaction` correspondente (o `CreditWallet` não persiste seu próprio ledger — isso é orquestrado pelo caso de uso).

### Casos de uso
- `AddCreditsUseCase` — chamado pelo módulo `payment` após confirmação de pagamento.
- `DebitCreditsUseCase` — chamado pelo módulo `job-unlock` durante o desbloqueio.
- `GetWalletBalanceUseCase` — leitura de saldo para exibição ao trabalhador.

### Portas
```typescript
interface CreditWalletRepository {
  save(wallet: CreditWallet): Promise<void>;
  findByWorkerId(workerId: WorkerId): Promise<CreditWallet | null>;
  getOrCreateForWorker(workerId: WorkerId): Promise<CreditWallet>;
}

interface CreditTransactionRepository {
  save(transaction: CreditTransaction): Promise<void>;
  findByWallet(walletId: CreditWalletId): Promise<CreditTransaction[]>;
}
```

## 7. Módulo `payment`

### Entidades
- **CreditPackage** — catálogo estático/administrável: `id: CreditPackageId`, `name: string`, `price: Money`, `creditsAmount: CreditAmount`, `active: boolean`.
- **Payment** (agregado raiz) — `id: PaymentId`, `workerId: WorkerId`, `creditPackageId: CreditPackageId`, `amount: Money`, `creditsAmount: CreditAmount`, `status: PaymentStatus`, `pixTxId: string`, `pixE2eId?: string`, `createdAt: Date`, `expiresAt: Date`, `confirmedAt?: Date`.

### Value objects
- `PaymentId`, `PaymentStatus` = `PENDING | CONFIRMED | EXPIRED`

### Agregado
`Payment` guarda o ciclo de vida de uma cobrança Pix (regras 15–19):
- `confirm(e2eId: string)` — só tem efeito se `status === PENDING`; chamadas repetidas (mesmo `e2eId`) são no-op (idempotência da regra 17). Se já `CONFIRMED`, apenas retorna sem erro.
- `expire()` — só tem efeito se `status === PENDING` e `now() > expiresAt` (regra 19).

Este é o módulo que expõe a porta central de desacoplamento do domínio em relação ao provedor de pagamento:

```typescript
interface PixPaymentGateway {
  createCharge(input: {
    amount: Money;
    externalReferenceId: PaymentId;
    expiresAt: Date;
  }): Promise<{ pixTxId: string; qrCode: string; qrCodeImageBase64: string }>;

  getChargeStatus(pixTxId: string): Promise<'ATIVA' | 'CONCLUIDA' | 'REMOVIDA_PELO_USUARIO_RECEBEDOR' | 'REMOVIDA_PELO_PSP'>;
}
```

`PixPaymentGateway` é definida no Domain/Application e implementada na Infra (ver [03-arquitetura-tecnica.md](03-arquitetura-tecnica.md)) por um adapter que fala diretamente com a API Pix do Banco Inter. Trocar o Banco Inter por outro PSP no futuro significa escrever um novo adapter, sem tocar em `Payment`, nos casos de uso ou em qualquer regra de negócio.

### Casos de uso
- `CreatePixChargeUseCase` — cria `Payment(PENDING)`, chama `PixPaymentGateway.createCharge`, persiste o `pixTxId` retornado.
- `ConfirmPaymentUseCase` — acionado pelo webhook; localiza `Payment` pelo `pixTxId`, chama `.confirm(e2eId)`, e — se a confirmação teve efeito (não era um duplicado) — chama `AddCreditsUseCase` (módulo `credit`) na mesma transação de aplicação (ver seção 9).
- `ExpirePendingPaymentsUseCase` — job agendado (regra 19).
- `ReconcilePaymentsUseCase` — job agendado que consulta `PixPaymentGateway.getChargeStatus` para pagamentos `PENDING` cujo `pixTxId` já existe, cobrindo o caso de um webhook perdido (ver arquitetura, seção de reconciliação).

### Portas
```typescript
interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: PaymentId): Promise<Payment | null>;
  findByPixTxId(pixTxId: string): Promise<Payment | null>;
  findPendingExpiredBefore(now: Date): Promise<Payment[]>;
  findPendingOlderThan(threshold: Date): Promise<Payment[]>; // usado pela reconciliação
}

interface CreditPackageRepository {
  findActive(): Promise<CreditPackage[]>;
  findById(id: CreditPackageId): Promise<CreditPackage | null>;
}
```

## 8. Módulo `job-unlock`

### Entidades
- **JobUnlock** (agregado raiz) — `id: JobUnlockId`, `workerId: WorkerId`, `jobPostingId: JobPostingId`, `creditsSpent: CreditAmount`, `unlockedAt: Date`.

### Agregado
`JobUnlock` é um registro simples e imutável: uma vez criado, nunca é alterado (regra 27 — não há "devolução" de desbloqueio). A unicidade do par `(workerId, jobPostingId)` é uma invariante forte, garantida por constraint única no banco **e** verificada explicitamente no caso de uso antes de debitar créditos.

### Caso de uso central: `UnlockJobPostingUseCase`

Este é o caso de uso mais sensível do domínio (regras 11–14) e roda dentro de uma única transação de banco de dados:

1. Verifica se já existe `JobUnlock` para `(workerId, jobPostingId)`.
   - Se existir: retorna o desbloqueio existente sem debitar créditos novamente (idempotência — regra 13).
2. Se não existir:
   a. Carrega `JobPosting`, obtém `unlockCost`.
   b. Carrega (ou cria) o `CreditWallet` do trabalhador.
   c. Chama `wallet.debit(unlockCost)` — lança `InsufficientCreditsError` se saldo insuficiente (regra 11).
   d. Persiste o `CreditWallet` atualizado e o `CreditTransaction(type: 'DEBIT')`.
   e. Cria e persiste o `JobUnlock`.
3. Todas as escritas do passo 2 ocorrem atomicamente: se qualquer uma falhar, nenhuma é efetivada (regra 14).

Ver [03-arquitetura-tecnica.md](03-arquitetura-tecnica.md) para como a porta de Unit of Work materializa essa transação através dos repositórios de `credit` e `job-unlock`.

### Portas
```typescript
interface JobUnlockRepository {
  save(unlock: JobUnlock): Promise<void>;
  findByWorkerAndJobPosting(workerId: WorkerId, jobPostingId: JobPostingId): Promise<JobUnlock | null>;
  findByWorker(workerId: WorkerId): Promise<JobUnlock[]>;
}
```

## 9. Unit of Work (porta transversal)

Casos de uso que escrevem em mais de um agregado/repositório na mesma operação (`UnlockJobPostingUseCase`, `ConfirmPaymentUseCase`, `ApproveJobPostingUseCase`/`RejectJobPostingUseCase`) dependem de uma porta de transação definida no Application:

```typescript
interface UnitOfWork {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
```

A Infra implementa essa porta usando uma transação do Prisma. Isso mantém o Domain/Application livres de qualquer referência a `PrismaClient` — ver [03-arquitetura-tecnica.md](03-arquitetura-tecnica.md).

## 10. Módulo `admin`

### Entidades
- **Admin** (agregado raiz) — `id: AdminId`, `name: string`, `email: Email`, `createdAt: Date`.

### Casos de uso
`admin` é majoritariamente um módulo de orquestração/autorização fina sobre casos de uso de outros módulos:
- `SuspendCompanyUseCase` / `ReactivateCompanyUseCase` (delega para o módulo `company`, regra 23).
- `SuspendWorkerUseCase` / `ReactivateWorkerUseCase` (delega para o módulo `worker`, regra 24).
- Casos de uso de moderação (`ListPendingModerationUseCase`, `ApproveJobPostingUseCase`, `RejectJobPostingUseCase`) são expostos ao admin mas pertencem ao módulo `moderation`.

### Portas
```typescript
interface AdminRepository {
  findById(id: AdminId): Promise<Admin | null>;
  findByEmail(email: Email): Promise<Admin | null>;
}
```

Autenticação/autorização de admin (login, sessão, RBAC) é tratada na camada de Infra/Container (ver arquitetura) e não faz parte do modelo de domínio.

## 11. Mapa de dependências entre módulos

```
admin        --> company, worker, moderation
moderation   --> job-posting
job-unlock   --> job-posting, credit
payment      --> credit
job-posting  --> company (apenas leitura, para toFullView())
```

`company`, `worker` e `credit` não dependem de nenhum outro módulo de domínio — são os módulos "de base". Nenhum módulo depende de `admin`, o que evita que regras de negócio do domínio conheçam conceitos de autenticação/autorização.
