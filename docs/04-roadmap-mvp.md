# Eteron Hub — Roadmap do MVP

Fases pensadas para permitir validação incremental: cada fase entrega algo
demonstrável, e a integração financeira (parte mais arriscada/trabalhosa) é isolada
cedo para não virar bloqueio no fim do projeto.

## Fase 0 — Fundação
- Setup do monorepo (`apps/api`, `apps/web`), Docker Compose (Postgres), CI básico
  (lint + testes).
- `shared/domain` e `shared/application`: classes base (`Entity`, `ValueObject`,
  `AggregateRoot`, `DomainError`, `UseCase<Input, Output>`).
- Value Objects compartilhados (`Cnpj`, `Cpf`, `Email`, `PhoneNumber`, `Money`,
  `CreditAmount`) com testes unitários exaustivos (são a base de confiança de todo o
  domínio).

## Fase 1 — Identidade
- Módulos `company`, `worker`, `admin` (entidades + casos de uso de cadastro).
- Módulo `auth`: login, JWT (access/refresh), guards por role.
- Telas Next.js: cadastro/login de empresa e trabalhador.

## Fase 2 — Vagas e Moderação
- Módulo `job-posting`: CRUD, máquina de estados (`DRAFT` → `PENDING_MODERATION` →
  `APPROVED`/`REJECTED`, transições subsequentes).
- Módulo `moderation`: log de auditoria.
- Painel admin: fila de moderação (aprovar/rejeitar com motivo).
- Listagem pública anonimizada de vagas (sem créditos/pagamento ainda).
- Job agendado de expiração de vagas.

## Fase 3 — Créditos e Pagamento (Pix / Banco Inter)
- Módulo `credit`: `CreditWallet`, `CreditTransaction`, `CreditPackage` (CRUD admin).
- Módulo `payment`: `PixCharge`, porta `PixPaymentGateway`, implementação
  `BancoInterPixGateway` (sandbox do Banco Inter primeiro).
- Webhook de confirmação + job de reconciliação (fallback de polling).
- Telas: compra de pacote de créditos, exibição de QR Code/copia-e-cola, extrato da
  carteira.
- **Critério de saída da fase**: fluxo completo testado em sandbox do Banco Inter,
  incluindo cenário de webhook duplicado (idempotência) e cobrança expirada.

## Fase 4 — Desbloqueio de Vagas
- Módulo `job-unlock`: `UnlockJobPostingUseCase` (transacional: débito + liberação de
  contato + idempotência por já-desbloqueado).
- Tela do trabalhador: botão de desbloqueio na vaga, exibição dos dados de contato após
  sucesso, histórico de vagas desbloqueadas.
- **Critério de saída**: ponta a ponta funcionando — cadastro → vaga aprovada → compra
  de crédito real (sandbox) → desbloqueio → dados revelados.

## Fase 5 — Painel Admin Completo e Métricas
- Gestão de empresas (suspender/reativar).
- Métricas: receita por período, taxa de aprovação de vagas, taxa de conversão de
  desbloqueio, vagas pendentes por tempo médio de moderação.
- Configurações da plataforma (`PlatformSetting`): custo padrão de desbloqueio, dias de
  expiração de vaga, minutos de expiração de cobrança Pix.

## Fase 6 — Hardening e Go-Live
- Passagem de sandbox para produção na API do Banco Inter (certificado mTLS de
  produção, homologação).
- Revisão de segurança (rate limiting em endpoints públicos e de auth, validação de
  entrada em todos os DTOs, revisão LGPD de logs).
- Testes de carga na listagem pública de vagas (endpoint mais exposto a tráfego não
  autenticado).
- Observabilidade: dashboards de erro de webhook, alertas de cobrança presa em
  `PENDING`.

## Fora do MVP (backlog futuro)
- Chat interno empresa ↔ trabalhador.
- Reputação/avaliação.
- Custo de desbloqueio variável por categoria/demanda.
- App mobile nativo.
- Múltiplos provedores de Pix (a porta `PixPaymentGateway` já permite isso sem
  refatoração de domínio).
