# Operação e Lançamento — EteronHub

Este documento cobre a Fase 6 do [roadmap](04-roadmap-mvp.md): o que precisa existir para que o EteronHub receba tráfego e dinheiro reais com segurança, e o que fazer quando algo dá errado em produção. Ele assume que as Fases 0–5 estão implementadas (identidade, vagas/moderação, pagamento, desbloqueio, frontend).

## 1. O que já existe vs. o que ainda depende de infraestrutura real

Esta fase foi implementada e validada localmente (Postgres via Docker, sem acesso a um ambiente de produção real nem a credenciais do Banco Inter). O que é código está pronto e testado; o que depende de infraestrutura externa fica documentado como checklist.

**Implementado e testado nesta fase:**
- Rate limiting (`@nestjs/throttler`): 100 req/min por IP como padrão global, 5 req/min em `/auth/login`, `/admin/auth/login`, `POST /companies`, `POST /workers` (alvos de força bruta e criação de contas em massa), 30 req/min no webhook do Pix.
- Validação do webhook do Pix por segredo compartilhado (`WebhookSecretGuard`, header `x-webhook-secret`) — defesa em profundidade além do mTLS que o Banco Inter já usa para autenticar a chamada.
- Logging estruturado nos pontos que mais importam para diagnóstico: confirmação de pagamento, criação de cobrança Pix (incluindo falha ao chamar o Inter — alvo de alerta), desbloqueio de vaga, aprovação/rejeição de moderação, reconciliação.
- Primeira migration do Prisma versionada (`prisma/migrations/`), permitindo `prisma migrate deploy` em vez de depender de `db push` implícito.
- Script de smoke test (`apps/api/scripts/smoke-test.mjs`).

**Depende de acesso a infraestrutura real, não implementável nesta sessão:**
- Certificado mTLS e credenciais de produção do Banco Inter.
- Ambiente de produção em si (servidor, banco gerenciado, DNS, TLS do próprio EteronHub).
- Rotação de segredos em um cofre (Vault, AWS Secrets Manager, etc.) — hoje os segredos vivem em variáveis de ambiente simples.

## 2. Checklist de variáveis de ambiente de produção

Ver [`apps/api/.env.example`](../apps/api/.env.example) para a lista completa. Antes do go-live, confirme especificamente:

- [ ] `DATABASE_URL` aponta para o Postgres de produção (não o de desenvolvimento).
- [ ] `JWT_SECRET` é um valor novo, gerado aleatoriamente (ex.: `openssl rand -base64 48`), diferente de qualquer ambiente de teste.
- [ ] `CORS_ORIGIN` lista exatamente os domínios do frontend de produção — nunca `*` nem um domínio de dev esquecido.
- [ ] `ADMIN_EMAIL`/`ADMIN_PASSWORD` do seed são trocados por credenciais reais e a senha é alterada logo após o primeiro login (o seed só garante a existência da conta, não força troca de senha).
- [ ] `BANCO_INTER_BASE_URL` aponta para o host de **produção** do Inter (não o sandbox) — confirmar na documentação oficial do Inter, nunca reaproveitar o valor usado em homologação.
- [ ] `BANCO_INTER_CERT_PATH`/`BANCO_INTER_KEY_PATH` apontam para o certificado mTLS de produção, com permissões de leitura restritas ao usuário do processo.
- [ ] `BANCO_INTER_PIX_KEY` é a chave Pix real da conta de recebimento do EteronHub.
- [ ] `BANCO_INTER_WEBHOOK_SECRET` está configurado (em dev ele pode ficar vazio; em produção isso é uma checagem a mais que não custa nada ter).

## 3. Checklist de segurança pré-lançamento

- [ ] `pnpm audit` (ou equivalente) rodado sem vulnerabilidades críticas abertas.
- [ ] Rate limiting confirmado em produção com uma chamada real (ver seção 5).
- [ ] Logs não vazam dados sensíveis — em particular, nenhum log imprime senha em texto plano, token JWT completo, ou dados de cartão/Pix além do necessário para diagnóstico (txid, e2eId são OK; CPF/CNPJ completos idealmente mascarados em logs de longa retenção).
- [ ] `NODE_ENV=production` está setado, para que dependências como o Express desabilitem mensagens de erro verbosas.
- [ ] O primeiro admin (seed) trocou a senha padrão.
- [ ] Certificado mTLS do Banco Inter tem data de expiração conhecida e um lembrete configurado (ver seção 4 — reconciliação/expiração de certificado é uma causa comum de incidente silencioso).

## 4. Runbook de reconciliação manual

**Sintoma:** um trabalhador reporta "paguei mas não recebi os créditos", ou o painel de monitoramento mostra pagamentos `PENDING` acumulando.

1. **Confirme que o job de reconciliação está rodando.** `ReconcilePaymentsJob` roda a cada 5 minutos (`@Cron(CronExpression.EVERY_5_MINUTES)`) e já resolve o caso comum de webhook perdido — a maioria dos "sumiços" de crédito se resolve sozinha em até 5 minutos. Confira os logs por `ReconcilePaymentsUseCase` para esse `paymentId`.
2. **Se o job não resolveu**, busque o pagamento pelo `paymentId` (o trabalhador consegue ver isso na tela de checkout, ou busque pelo e-mail dele no banco):
   ```sql
   select * from "Payment" where id = '<paymentId>';
   ```
3. **Verifique o status real no Banco Inter** consultando `GET /pix/v2/cob/{txid}` diretamente (o `pixTxId` do registro acima) com as credenciais de produção. Se o status lá for `CONCLUIDA` mas o registro local seguir `PENDING`, o webhook realmente se perdeu e a reconciliação automática ainda não rodou ou falhou.
4. **Force a reconciliação manualmente** chamando `ConfirmPaymentUseCase` para aquele `pixTxId` (via um script one-off ou reexecutando o job manualmente) — a operação é idempotente (regra 17), então não há risco de creditar duas vezes mesmo que o webhook chegue depois.
5. **Se o status no Inter for `ATIVA`** (cobrança nunca paga) e o trabalhador insiste que pagou, oriente-o a verificar o comprovante do próprio banco dele — nesse caso o problema está fora do EteronHub.
6. **Nunca** credite manualmente sem confirmar o status no Inter primeiro — isso quebraria a garantia de que todo crédito corresponde a um pagamento real (documento 1, fluxo de créditos).

## 5. Smoke tests pós-deploy

Depois de todo deploy em produção, rode:

```bash
BASE_URL=https://api.eteronhub.com node apps/api/scripts/smoke-test.mjs
```

O script confirma: a API está no ar, conectou no banco (via `/credit-packages`), o catálogo público responde, e o pipeline de autenticação está funcionando (login inválido retorna 401). Não testa o fluxo de pagamento real — isso exigiria gastar dinheiro de verdade a cada deploy, o que não vale a pena; a cobertura de pagamento vem dos testes unitários (`pnpm --filter api test`) mais uma verificação manual periódica com um valor mínimo.

## 6. Plano de rollback

- **Aplicação (API/frontend):** deploys devem ser feitos de forma que o deploy anterior continue disponível para rollback imediato (ex.: manter a imagem/build anterior, não sobrescrever). Reverter é redeployar a versão anterior.
- **Banco de dados:** migrations do Prisma são aditivas por padrão neste projeto (nenhuma migration até agora remove coluna ou tabela). Antes de qualquer migration que remova ou renomeie algo, faça backup do banco e tenha o `migration.sql` de reversão pronto — o Prisma não gera rollback automático.
- **Se o problema for na integração Pix** (ex.: certificado expirado, credencial revogada), a aplicação continua funcionando para todo o resto (cadastro, vagas, moderação, desbloqueio de vagas já pagas) — apenas a compra de novos créditos fica indisponível. Comunique isso claramente no lugar de tirar o sistema inteiro do ar.
- **Critério para reverter um deploy:** taxa de erro 5xx acima do normal por mais de alguns minutos, ou falha nos smoke tests pós-deploy (seção 5).
