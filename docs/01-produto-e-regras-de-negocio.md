# Eteron Hub — Especificação de Produto

## 1. Visão Geral

Eteron Hub é um marketplace B2B verticalizado no setor de **metalurgia e estruturas
metálicas**, que conecta:

- **Empresas** que precisam contratar mão de obra ou prestadores de serviço
  (soldadores, caldeireiros, montadores, serralheiros, projetistas, técnicos de
  segurança, etc.)
- **Trabalhadores/prestadores de serviço** em busca de oportunidades no setor

O diferencial do modelo é o **anonimato da empresa até o desbloqueio pago**: a vaga é
pública, mas os dados de contato da empresa só são revelados ao trabalhador depois que
ele compra créditos via Pix e desbloqueia aquela vaga específica. É esse desbloqueio que
sustenta financeiramente a plataforma.

## 2. Personas

| Persona | Descrição | Objetivo principal |
|---|---|---|
| **Empresa** | Pessoa jurídica do setor metalúrgico/estruturas metálicas | Publicar vagas e encontrar mão de obra qualificada rapidamente |
| **Trabalhador** | Profissional autônomo ou CLT em busca de oportunidades | Encontrar vagas compatíveis e conseguir contato direto com a empresa |
| **Admin (moderador da plataforma)** | Time interno do Eteron Hub | Garantir qualidade/legitimidade das vagas publicadas e operação financeira saudável |

## 3. Fluxo Principal (Ponta a Ponta)

```
Empresa se cadastra
        │
        ▼
Empresa publica vaga  ──────────► Vaga = status DRAFT
        │
        ▼
Empresa envia para moderação ───► Vaga = status PENDING_MODERATION
        │
        ▼
Admin analisa a vaga
        │
        ├── Rejeita ──► Vaga = status REJECTED (empresa é notificada, pode corrigir e reenviar)
        │
        └── Aprova ──► Vaga = status APPROVED (visível publicamente, dados da empresa ANÔNIMOS)
                              │
                              ▼
                    Trabalhador navega pelas vagas públicas
                              │
                              ▼
                    Trabalhador se interessa por uma vaga
                              │
                              ▼
                    Trabalhador não tem créditos suficientes?
                              │
                    ┌─────────┴─────────┐
                    │ Sim                │ Não
                    ▼                    ▼
        Compra pacote de créditos   Desbloqueia a vaga
        via Pix (Banco Inter)       imediatamente
                    │                    │
                    ▼                    │
        Pagamento confirmado             │
        (webhook Banco Inter)            │
        créditos entram na carteira      │
                    │                    │
                    └─────────┬──────────┘
                               ▼
                    Créditos são debitados da carteira
                               ▼
                    Dados de contato da empresa são revelados
                    (razão social, telefone, e-mail, WhatsApp)
                               ▼
                    Trabalhador entra em contato diretamente com a empresa
```

## 4. Regras de Negócio

### 4.1 Cadastro e Autenticação
- RN-01: Existem três tipos de conta: `COMPANY`, `WORKER`, `ADMIN`. Cada uma tem seu
  próprio fluxo de cadastro/login.
- RN-02: Cadastro de empresa exige CNPJ válido (validação de dígito verificador) e
  dados de contato (telefone, e-mail, responsável).
- RN-03: Cadastro de trabalhador exige CPF válido, nome completo, telefone e e-mail.
- RN-04: CNPJ e CPF são únicos na plataforma (não é permitido duplicidade de conta).
- RN-05: Autenticação via e-mail/senha (hash com bcrypt/argon2) + JWT. Preparar
  extensão futura para login social, mas não é MVP.

### 4.2 Vagas (Job Postings)
- RN-06: Toda vaga criada por uma empresa nasce no status `DRAFT` e **não é visível**
  para trabalhadores.
- RN-07: Ao ser enviada para publicação, a vaga muda para `PENDING_MODERATION` e entra
  na fila de moderação do admin.
- RN-08: Uma vaga só fica **publicamente visível** após ser aprovada
  (`APPROVED`) por um admin.
- RN-09: Uma vaga aprovada e listada publicamente exibe: categoria/função, descrição,
  cidade/UF, faixa salarial (opcional), tipo de contrato, data de publicação. **Nunca**
  exibe: razão social, CNPJ, telefone, e-mail, nome do responsável, endereço completo,
  logo da empresa.
- RN-10: O admin pode rejeitar uma vaga com motivo obrigatório. A empresa é notificada
  e pode editar e reenviar (a vaga volta para `DRAFT` → `PENDING_MODERATION`).
- RN-11: O admin pode, a qualquer momento, suspender uma vaga já aprovada (ex.: denúncia
  de trabalhador, suspeita de fraude), movendo-a para `SUSPENDED` (some da listagem
  pública imediatamente).
- RN-12: Vagas aprovadas expiram automaticamente após N dias configuráveis (padrão: 30
  dias) sem nova ação da empresa, passando para `EXPIRED`.
- RN-13: A empresa pode fechar manualmente uma vaga (`CLOSED`) quando a posição for
  preenchida.
- RN-14: Toda decisão de moderação (aprovação/rejeição/suspensão) é registrada em log de
  auditoria com admin responsável, motivo e timestamp — não é destrutiva/editável.

### 4.3 Créditos e Pagamento (Pix)
- RN-15: Trabalhadores compram **pacotes de créditos** pré-definidos (ex.: 5, 10, 25
  créditos), cada um com preço em R$ configurado pelo admin.
- RN-16: A compra gera uma cobrança Pix (via API do Banco Inter) com QR Code e "copia e
  cola", com prazo de expiração (ex.: 30 minutos).
- RN-17: A confirmação do pagamento é feita via **webhook** do Banco Inter. O
  processamento do webhook deve ser **idempotente** (o mesmo evento pode chegar mais de
  uma vez e não deve creditar em duplicidade).
- RN-18: Créditos só entram na carteira do trabalhador após confirmação efetiva do
  pagamento (nunca antes/otimisticamente).
- RN-19: Cobranças Pix expiradas e não pagas não geram créditos e são marcadas como
  `EXPIRED`.
- RN-20: Toda movimentação de créditos (compra, consumo, eventual estorno) gera um
  registro imutável de transação na carteira (extrato).

### 4.4 Desbloqueio de Vagas
- RN-21: Cada vaga aprovada tem um **custo em créditos para desbloqueio** (valor padrão
  definido em configuração da plataforma, podendo variar por vaga/categoria no futuro).
- RN-22: Desbloquear uma vaga debita os créditos da carteira do trabalhador e cria um
  registro de `JobUnlock` vinculando trabalhador ↔ vaga.
- RN-23: Se o trabalhador já desbloqueou aquela vaga antes, o sistema **não cobra
  novamente** — o acesso aos dados é permanente e idempotente a partir do primeiro
  desbloqueio.
- RN-24: Se o saldo de créditos for insuficiente, o desbloqueio é bloqueado e o
  trabalhador é direcionado à compra de créditos.
- RN-25: O desbloqueio é uma operação transacional: débito de créditos e liberação dos
  dados de contato acontecem atomicamente (nunca cobra sem liberar, nunca libera sem
  cobrar).

### 4.5 Administração
- RN-26: Admin tem painel para: fila de moderação, gestão de empresas (ativar/suspender),
  gestão de pacotes de créditos e preços, extrato financeiro (Pix recebidos), métricas
  (vagas pendentes, taxa de aprovação, receita por período, taxa de conversão
  desbloqueio).
- RN-27: Ações administrativas sensíveis (suspender empresa, remover vaga) exigem
  motivo registrado.

## 5. Fora de Escopo do MVP (mencionar, não implementar)
- Chat interno entre empresa e trabalhador
- Avaliação/reputação de empresas e trabalhadores
- Split de pagamento / múltiplos gateways Pix
- Aplicativo mobile nativo
- Assinatura recorrente para empresas (modelo é 100% pay-per-unlock via crédito do
  trabalhador)

## 6. Glossário
- **Vaga (Job Posting)**: oportunidade de trabalho publicada por uma empresa.
- **Moderação**: processo de aprovação/rejeição de uma vaga pelo admin antes de ficar
  pública.
- **Anonimização**: ocultação dos dados identificadores da empresa em vagas públicas.
- **Crédito**: unidade de saldo pré-paga pelo trabalhador, usada para desbloquear vagas.
- **Desbloqueio (Unlock)**: ato de gastar créditos para revelar os dados de contato da
  empresa de uma vaga específica.
- **Pix Charge / Cobrança Pix**: cobrança gerada via API do Banco Inter para compra de
  créditos.
