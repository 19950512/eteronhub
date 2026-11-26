# LGPD e privacidade

Como o Eteron Hub atende a Lei nº 13.709/2018 (LGPD): o que está implementado,
onde fica no código e o que ainda depende de decisão ou de infraestrutura. Os
textos públicos estão em `/politica-de-privacidade` e `/termos-de-uso`.

## O que está implementado

| Requisito                                                                                               | Onde                                                                                                          |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Aceite explícito, em caixas separadas e desmarcadas, de Termos, Política e maioridade (18+) no cadastro | `apps/web/src/components/legal/legal-consent-fields.tsx`; regra em `shared-kernel/domain/legal-consent.vo.ts` |
| Prova do consentimento (art. 8º §2º): versão dos documentos, data, IP e navegador                       | tabela `ConsentRecord` (só inserção), gravada por `CONSENT_LOG` antes de a conta existir                      |
| Acesso e portabilidade (art. 18, II e V): arquivo JSON com tudo o que guardamos                         | `GET /me/privacy/export` → `ExportPersonalDataUseCase` + `PrismaPersonalDataReader`                           |
| Eliminação (art. 18, VI): exclusão imediata pelo próprio titular, com senha                             | `POST /me/privacy/account-deletion` → `DeleteWorkerAccountUseCase` / `DeleteCompanyAccountUseCase`            |
| Painel do titular                                                                                       | seção "Privacidade e dados" em `/painel/perfil` e `/empresa/perfil`                                           |

## Versões dos documentos

`TERMS_OF_USE_VERSION` e `PRIVACY_POLICY_VERSION` existem em dois lugares que precisam
andar juntos: `apps/api/src/shared-kernel/domain/legal-consent.vo.ts` (o que fica gravado
no aceite) e `apps/web/src/lib/legal.ts` (o que aparece no topo das páginas). Ao mudar o
texto de um documento, suba a versão nos dois. Contas antigas continuam com o aceite
da versão anterior; pedir novo aceite ainda não está implementado.

## Exclusão de conta: o que sai e o que fica

É anonimização, não `DELETE`: o id continua, porque pagamentos, créditos e desbloqueios
apontam para ele e são registros financeiros de guarda obrigatória (art. 16, I).

| Conta       | Apagado                                                                                                                        | Mantido (e por quê)                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Trabalhador | nome (vira "Conta excluída"), e-mail (vira `excluida-<id>@conta-excluida.invalid`), senha, telefone, bio, segmentos, softwares | CPF — identifica o pagador dos Pix já feitos                                                            |
| Empresa     | nome fantasia, e-mail, senha, setor, cidade/UF, WhatsApp, site; vagas abertas/em moderação/rascunho viram `CLOSED`             | CNPJ e razão social — dado cadastral público da PJ, aparece no histórico de quem pagou pelo desbloqueio |

O status vira `DELETED` e `deletedAt` é preenchido. O `AccountStatusReader` só aceita
`ACTIVE`, então tokens já emitidos param de valer na hora. Uma conta excluída não pode
ser suspensa nem reativada pelo admin.

Consequência conhecida: como o CPF/CNPJ fica, a mesma pessoa ou empresa não consegue
se cadastrar de novo com ele. O e-mail é liberado.

O contato informado nas vagas (e-mail, telefone, link) fica gravado: a regra do domínio
exige ao menos um contato por vaga, e trabalhadores que já pagaram pelo desbloqueio
continuam com acesso ao que compraram.

## Compartilhamento

- **Banco Inter**: a cobrança Pix leva só valor e descrição (`banco-inter-pix.gateway.ts`);
  nome e CPF do trabalhador não são enviados.
- **Cloudflare** (proxy do domínio) e o servidor da VPS.
- Não há analytics, cookies de publicidade nem e-mail marketing.

## Pendências (fora do código)

- [ ] Identificar o controlador na Política (razão social e CNPJ de quem opera o Eteron Hub).
- [ ] Criar as caixas `privacidade@eteronhub.com.br` (encarregado/DPO) e
      `contato@eteronhub.com.br`, citadas nos textos.
- [ ] Revisão jurídica dos dois textos antes de depender deles.
- [ ] Guarda de 6 meses dos registros de acesso (Marco Civil, art. 15): hoje os logs dos
      containers giram a cada 3 × 10 MB (`deploy/vps/docker-compose.yml`), o que
      provavelmente não cobre 6 meses.
- [ ] Rotina para eliminar o que passar do prazo legal (CPF/CNPJ e registros financeiros
      de contas excluídas há mais de 5 anos). Hoje nada é apagado automaticamente.
- [ ] Fluxo de reembolso do arrependimento (7 dias, CDC art. 49) para créditos não usados:
      os Termos prometem atendimento por e-mail, mas não há operação de estorno na carteira.
- [ ] Pedir novo aceite quando a versão dos documentos mudar.
