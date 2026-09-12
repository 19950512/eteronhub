# Roadmap do MVP — EteronHub

O roadmap é dividido em 6 fases incrementais. A decisão mais importante do sequenciamento é **isolar a integração com o Pix do Banco Inter na Fase 3**, logo depois do núcleo de cadastro/vagas e antes do desbloqueio e do frontend completo. É a peça de maior risco técnico do projeto (dependência externa, certificado mTLS, sandbox de terceiro, webhook, dinheiro real) — colocá-la no meio do roadmap dá tempo de reagir a surpresas da API do Inter sem comprometer a data de lançamento, em vez de descobrir problemas de última hora com o produto já quase pronto.

Cada fase assume que a anterior foi concluída. Referências entre parênteses apontam para as seções correspondentes em [01-produto-e-regras-de-negocio.md](01-produto-e-regras-de-negocio.md), [02-modelo-de-dominio.md](02-modelo-de-dominio.md) e [03-arquitetura-tecnica.md](03-arquitetura-tecnica.md).

## Visão geral

| Fase | Nome | Foco principal |
|---|---|---|
| 0 | Fundação | Monorepo, value objects compartilhados, esqueleto das 4 camadas |
| 1 | Identidade | Cadastro/autenticação de empresa, trabalhador e admin |
| 2 | Vagas e moderação | Ciclo de vida da vaga, anonimização, fila de moderação |
| 3 | Pagamento (Pix / Banco Inter) | Créditos, cobrança Pix, webhook, reconciliação |
| 4 | Desbloqueio | Consumo de créditos, transação idempotente, dados completos da vaga |
| 5 | Frontend completo | Telas de empresa, trabalhador e admin no Next.js |
| 6 | Hardening e lançamento | Observabilidade, segurança, ambiente de produção, go-live |

## Fase 0 — Fundação

**Objetivo:** ter o monorepo rodando (lint, build, testes) e os blocos de construção compartilhados prontos, antes de qualquer regra de negócio.

- Setup do pnpm workspace (`apps/api`, `apps/web`, `packages/shared-types`, `packages/config`).
- Projeto NestJS inicial (`apps/api`) e projeto Next.js inicial (`apps/web`), ambos com TypeScript estrito.
- `prisma/schema.prisma` inicial (sem models de negócio ainda — só a configuração de conexão) e `PrismaService`.
- `shared-kernel`: `CNPJ`, `CPF`, `Email`, `Money`, `CreditAmount` (com testes unitários cobrindo os casos de validação inválida).
- Esqueleto da `UnitOfWork` (interface no Application + implementação Prisma no Infra) — ainda sem casos de uso reais para usá-la.
- CI básico: lint + testes unitários em cada PR.

**Critério de saída:** `pnpm test` roda verde no monorepo vazio, e os value objects compartilhados têm cobertura de teste para os casos de validação (CNPJ/CPF inválidos, `Money`/`CreditAmount` negativos).

## Fase 1 — Identidade (empresa, trabalhador, admin)

**Objetivo:** qualquer pessoa consegue se cadastrar e autenticar; existe pelo menos um admin.

- Módulo `company`: entidade, `CompanyRepository` (Prisma), casos de uso de registro/suspensão/reativação (regras 1, 23).
- Módulo `worker`: entidade, `WorkerRepository` (Prisma), casos de uso de registro/suspensão/reativação (regras 2, 24).
- Módulo `admin`: entidade `Admin`, seed script para criar o primeiro admin (não há fluxo de auto-cadastro de admin).
- Autenticação JWT para empresa/trabalhador (`POST /auth/login`); sessão separada para admin.
- Migrations Prisma para `Company`, `Worker`, `Admin`.

**Critério de saída:** dá para cadastrar uma empresa com CNPJ, um trabalhador com CPF, logar com ambos, e um admin (via seed) consegue autenticar em uma rota protegida. Testes cobrindo unicidade de CNPJ/CPF (regras 1 e 2).

## Fase 2 — Vagas e moderação

**Objetivo:** empresas criam vagas, admins moderam, trabalhadores veem o catálogo anonimizado.

- Módulo `job-posting`: entidade com máquina de estados completa (`DRAFT → IN_MODERATION → PUBLISHED/REJECTED → CLOSED/EXPIRED`), `toAnonymizedView()`/`toFullView()`, `JobPostingRepository`.
- Endpoints de empresa: criar/editar rascunho, submeter para moderação, encerrar vaga.
- Módulo `moderation`: `ModerationDecision` (audit trail), casos de uso de aprovar/rejeitar, fila de pendentes.
- Endpoints de admin de moderação.
- Endpoint público de listagem/detalhe de vagas — neste ponto, `toFullView()` ainda não é alcançável (job-unlock ainda não existe), então todo detalhe retorna anonimizado.
- Job agendado de expiração de vagas publicadas (regra 21).

**Critério de saída:** uma vaga percorre o ciclo completo `DRAFT → submissão → aprovação → aparece no catálogo público anonimizada`, e o fluxo de rejeição-com-motivo-e-resubmissão funciona (regras 3–10).

## Fase 3 — Pagamento (Pix / Banco Inter)

**Objetivo:** trabalhador compra créditos com dinheiro real via Pix, direto com o Banco Inter — isolado do resto do produto.

- Módulo `credit`: `CreditWallet`, `CreditTransaction`, `AddCreditsUseCase`, `GetWalletBalanceUseCase`.
- Módulo `payment`: `CreditPackage` (catálogo), `Payment`, porta `PixPaymentGateway`.
- Infra: `BancoInterAuthService` (OAuth2 + mTLS), `BancoInterPixGateway` (criação de cobrança), `payment-webhook.controller.ts`, jobs de expiração e reconciliação.
- Ambiente sandbox do Banco Inter configurado (certificado de homologação, chave Pix de teste) antes de qualquer chamada em produção.
- Testes de integração do adapter contra o sandbox do Inter, e testes unitários de idempotência do `ConfirmPaymentUseCase` (regra 17) simulando webhooks duplicados.

**Por que isolar aqui:** nada no restante do produto depende de o Pix "de verdade" funcionar — o `job-unlock` (Fase 4) só depende do saldo em `CreditWallet`, que pode ser testado com créditos adicionados manualmente/via seed. Isso significa que, se a homologação com o Banco Inter atrasar (certificado, aprovação de conta, particularidades do sandbox), o restante do roadmap não trava.

**Critério de saída:** um pagamento Pix real (ou em sandbox) gera cobrança, é confirmado via webhook, credita a `CreditWallet` correta, e uma notificação duplicada do mesmo pagamento não credita duas vezes. O job de reconciliação confirma um pagamento cujo webhook foi simulado como "perdido".

## Fase 4 — Desbloqueio de vagas

**Objetivo:** trabalhador gasta créditos para ver os dados completos de uma vaga.

- Módulo `job-unlock`: `JobUnlock`, `UnlockJobPostingUseCase` — transação única cobrindo checagem de idempotência, débito de créditos e criação do registro de desbloqueio (regras 11–14).
- `GetJobPostingDetailsUseCase` (módulo `job-posting`) passa a consultar `job-unlock` para decidir entre `toAnonymizedView()` e `toFullView()`.
- Endpoint de histórico de desbloqueios do trabalhador.
- Testes de concorrência: duas chamadas simultâneas de desbloqueio para a mesma vaga pelo mesmo trabalhador resultam em um único débito (regra 13).

**Critério de saída:** um trabalhador com saldo suficiente desbloqueia uma vaga, passa a ver os dados completos, uma segunda tentativa de desbloqueio da mesma vaga não debita créditos de novo, e um trabalhador sem saldo suficiente recebe erro claro (sem débito parcial).

## Fase 5 — Frontend completo

**Objetivo:** as três personas conseguem operar o produto inteiramente pela UI, sem depender de chamadas manuais à API.

- **Público**: listagem e detalhe de vagas anonimizadas, cadastro de empresa/trabalhador, login.
- **Empresa**: dashboard com vagas por status, criação/edição de rascunho, submissão, encerramento, visualização do motivo de rejeição.
- **Trabalhador**: saldo de créditos, compra de pacote (tela de checkout Pix com QR code/copia-e-cola + polling de status), catálogo com indicação de já-desbloqueadas, fluxo de desbloqueio, histórico.
- **Admin**: fila de moderação (aprovar/rejeitar com motivo), gestão de suspensão de empresas/trabalhadores.

**Critério de saída:** um usuário novo consegue, sem nenhuma chamada de API manual, se cadastrar como trabalhador, comprar créditos via Pix (sandbox), encontrar uma vaga publicada por uma empresa de teste e desbloqueá-la — e uma empresa de teste consegue publicar essa vaga do zero, passando pela aprovação de um admin.

## Fase 6 — Hardening e lançamento

**Objetivo:** deixar o sistema pronto para receber tráfego e dinheiro reais.

- Observabilidade: logging estruturado nos casos de uso críticos (confirmação de pagamento, desbloqueio), métricas de erro, alertas para falhas do adapter do Banco Inter.
- Revisão de segurança focada no fluxo de pagamento: validação do webhook, rotação de segredos/certificado mTLS, rate limiting nos endpoints públicos e de autenticação.
- Runbook de reconciliação manual (o que fazer se um pagamento ficar "pendente" além do esperado).
- Ambiente de produção: variáveis de ambiente, certificado mTLS de produção do Banco Inter, chave Pix de produção, migrations aplicadas, seed do primeiro admin real.
- Testes de fumaça (smoke tests) end-to-end no ambiente de produção antes do go-live.
- Checklist de lançamento e plano de rollback.

**Critério de saída:** checklist de go-live assinado, ambiente de produção validado com uma transação Pix real de valor mínimo, e monitoramento básico ativo para os fluxos de pagamento e desbloqueio.
