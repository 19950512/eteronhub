# Produto e Regras de Negócio — EteronHub

## 1. Visão do produto

O EteronHub é um marketplace de vagas de emprego no qual **empresas publicam vagas de forma anônima** e **trabalhadores pagam com créditos para desbloquear os dados completos** de uma vaga (nome da empresa, contato, endereço, forma de aplicação).

O problema que resolve:

- **Para empresas**: divulgar vagas sem expor imediatamente sua marca, evitando concorrência de talento indesejada, spam de candidaturas não qualificadas ou exposição prematura de planos de contratação (ex.: expansão, novo produto, substituição de um cargo).
- **Para trabalhadores**: acesso a uma vitrine de vagas moderadas (reduzindo golpes e vagas fantasmas), pagando apenas pelas vagas que de fato despertaram interesse, em vez de depender só de anúncios genéricos.

O modelo de receita do MVP é a **venda de créditos** aos trabalhadores, consumidos no desbloqueio de vagas.

## 2. Personas

### 2.1 Empresa (Company)
- Pessoa jurídica, identificada por CNPJ.
- Cria e publica vagas.
- Não paga para publicar; a vaga fica anônima até ser desbloqueada por um trabalhador.
- Pode ter uma ou mais vagas em rascunho, em moderação, publicadas, expiradas ou encerradas.

### 2.2 Trabalhador (Worker)
- Pessoa física, identificada por CPF.
- Navega pelo catálogo de vagas anonimizadas (título, descrição, requisitos, faixa salarial, localização aproximada — sem nome da empresa).
- Compra créditos via Pix.
- Usa créditos para desbloquear uma vaga específica e visualizar os dados completos (nome da empresa, contato, forma de aplicação).

### 2.3 Moderador / Administrador (Admin)
- Usuário interno da plataforma.
- Revisa vagas submetidas pelas empresas antes da publicação (aprova ou rejeita com motivo).
- Pode suspender contas de empresas ou trabalhadores em caso de abuso ou fraude.
- Tem visibilidade sobre pagamentos, créditos e desbloqueios para fins de suporte e auditoria.

## 3. Fluxo ponta a ponta

1. **Cadastro da empresa** — a empresa se cadastra informando CNPJ, razão social e dados de contato. O CNPJ é validado (dígito verificador) e deduplicado (um CNPJ não pode ter duas contas ativas).
2. **Cadastro do trabalhador** — o trabalhador se cadastra informando CPF e dados pessoais. O CPF é validado e deduplicado.
3. **Criação da vaga** — a empresa cria uma vaga em modo rascunho (título, descrição, requisitos, faixa salarial, localização, dados de contato/aplicação).
4. **Submissão para moderação** — a empresa submete a vaga; ela entra na fila de moderação e não é visível publicamente.
5. **Moderação** — um admin aprova (a vaga é publicada) ou rejeita (a vaga volta para a empresa com o motivo, podendo ser corrigida e resubmetida).
6. **Publicação anônima** — a vaga aprovada aparece no catálogo público sem o nome da empresa nem dados de contato.
7. **Compra de créditos** — o trabalhador escolhe um pacote de créditos e paga via Pix. Após a confirmação do pagamento (webhook do Banco Inter), os créditos são adicionados ao saldo do trabalhador.
8. **Desbloqueio da vaga** — o trabalhador usa créditos do seu saldo para desbloquear uma vaga específica. A partir desse momento, ele passa a visualizar os dados completos daquela vaga (nome da empresa, contato, forma de aplicação).
9. **Reuso do desbloqueio** — desbloqueios já pagos são permanentes: o trabalhador pode revisitar a vaga desbloqueada sem custo adicional, mesmo que a vaga seja posteriormente encerrada.

## 4. Regras de negócio

1. Toda empresa é identificada por um CNPJ único e válido (dígitos verificadores corretos); não pode haver duas contas ativas com o mesmo CNPJ.
2. Todo trabalhador é identificado por um CPF único e válido; não pode haver duas contas ativas com o mesmo CPF.
3. Uma vaga só pode ser submetida à moderação se todos os campos obrigatórios estiverem preenchidos (título, descrição, requisitos, faixa salarial, localização, forma de contato/aplicação).
4. Uma vaga recém-criada começa no estado `RASCUNHO` e não é visível para trabalhadores.
5. Uma vaga só entra em `EM_MODERACAO` após submissão explícita da empresa.
6. Uma vaga só é publicada (`PUBLICADA`) após aprovação por um admin.
7. Uma vaga rejeitada retorna ao estado `RASCUNHO` (ou `REJEITADA`) acompanhada de um motivo textual obrigatório informado pelo admin.
8. Uma empresa pode resubmeter uma vaga rejeitada quantas vezes forem necessárias após corrigi-la.
9. Enquanto não desbloqueada por um trabalhador, uma vaga publicada exibe apenas dados anonimizados: nunca o nome da empresa, razão social, CNPJ ou dados de contato diretos.
10. O desbloqueio de uma vaga tem um custo em créditos definido no momento da publicação (não pode ser alterado após a vaga já ter sido desbloqueada por algum trabalhador).
11. Um trabalhador só pode desbloquear uma vaga se seu saldo de créditos for maior ou igual ao custo de desbloqueio da vaga.
12. O desbloqueio de uma vaga debita créditos do saldo do trabalhador e cria um registro de desbloqueio (`JobUnlock`) associando trabalhador e vaga.
13. Um mesmo trabalhador não pode ser cobrado duas vezes pelo desbloqueio da mesma vaga — se já existe um `JobUnlock` para o par (trabalhador, vaga), o acesso é concedido sem novo débito (operação idempotente).
14. O débito de créditos e a criação do registro de desbloqueio ocorrem na mesma transação: ou ambos acontecem, ou nenhum acontece (não pode haver crédito debitado sem desbloqueio registrado, nem desbloqueio sem débito correspondente).
15. Créditos são adquiridos exclusivamente através de pacotes pré-definidos, pagos via Pix.
16. Um pagamento Pix só libera créditos após confirmação de pagamento (webhook), nunca na simples geração da cobrança/QR Code.
17. O processamento de um webhook de pagamento é idempotente: notificações duplicadas do mesmo pagamento não geram crédito duplicado.
18. Todo pagamento tem um identificador externo (txid/e2e id) armazenado, usado para conciliação com o Banco Inter.
19. Pagamentos pendentes têm um prazo de expiração; após expirados, não podem mais ser confirmados e os créditos correspondentes não são liberados.
20. O saldo de créditos de um trabalhador nunca pode ficar negativo.
21. Vagas publicadas têm uma data de expiração; após expirar, deixam de aparecer no catálogo público, mas continuam acessíveis para trabalhadores que já as desbloquearam.
22. Uma empresa pode encerrar manualmente uma vaga publicada antes da expiração; o efeito é o mesmo da expiração (some do catálogo, mas permanece acessível para quem já desbloqueou).
23. Um admin pode suspender uma conta de empresa; vagas dessa empresa que estejam em `EM_MODERACAO` ou `RASCUNHO` não podem ser publicadas enquanto a suspensão estiver ativa. Vagas já publicadas permanecem visíveis, salvo decisão explícita do admin de despublicá-las.
24. Um admin pode suspender uma conta de trabalhador; um trabalhador suspenso não pode comprar créditos nem desbloquear novas vagas, mas mantém acesso às vagas já desbloqueadas anteriormente.
25. Toda ação de moderação (aprovação ou rejeição) fica registrada com o admin responsável e a data/hora, para fins de auditoria.
26. Não há reembolso automático de créditos: o desbloqueio de uma vaga é considerado um serviço prestado no momento em que os dados completos são revelados ao trabalhador.
27. Um trabalhador só pode ver a lista de vagas que já desbloqueou (histórico de desbloqueios) e não pode "devolver" um desbloqueio para recuperar créditos.

## 5. Fora do escopo do MVP

- Chat ou mensageria direta entre empresa e trabalhador dentro da plataforma.
- Algoritmo de matching/recomendação de vagas por perfil do trabalhador.
- Avaliações e reputação (empresa avalia trabalhador, trabalhador avalia empresa).
- Notificações push/e-mail transacionais além das mínimas necessárias (confirmação de pagamento).
- Múltiplos métodos de pagamento além de Pix (cartão de crédito, boleto).
- Múltiplos moderadores com fila distribuída, SLA de moderação ou automação de moderação (IA).
- Internacionalização / multi-idioma / multi-moeda.
- Planos de assinatura recorrente para trabalhadores (o modelo do MVP é pré-pago por créditos).
- Painel de analytics avançado para empresas (funil de desbloqueios, taxa de conversão, etc.).
- Reembolsos, disputas de pagamento (chargeback) e fluxo de mediação.

## 6. Glossário

| Termo | Definição |
|---|---|
| **Empresa (Company)** | Pessoa jurídica que publica vagas na plataforma, identificada por CNPJ. |
| **Trabalhador (Worker)** | Pessoa física que busca vagas e paga para desbloqueá-las, identificado por CPF. |
| **Vaga (Job Posting)** | Anúncio de oportunidade de trabalho criado por uma empresa, publicado de forma anônima até ser desbloqueado. |
| **Moderação** | Processo de revisão de uma vaga por um admin antes de sua publicação pública. |
| **Publicação anônima** | Estado em que a vaga está visível no catálogo público sem revelar a identidade da empresa. |
| **Crédito** | Unidade de saldo pré-paga pelo trabalhador, usada para desbloquear vagas. |
| **Desbloqueio (Job Unlock)** | Ato de consumir créditos para revelar os dados completos de uma vaga a um trabalhador específico. |
| **Pix** | Meio de pagamento instantâneo brasileiro, usado para compra de créditos, integrado diretamente com o Banco Inter. |
| **Webhook** | Notificação assíncrona enviada pelo Banco Inter confirmando o pagamento de uma cobrança Pix. |
| **Admin** | Usuário interno responsável por moderar vagas e administrar contas. |
| **Idempotência** | Propriedade de uma operação que, executada mais de uma vez com a mesma entrada, produz o mesmo efeito de uma única execução (ex.: não cobrar duas vezes pelo desbloqueio da mesma vaga). |
