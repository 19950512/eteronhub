# Pipeline de Planejamento → Implementação via Agentes

Este documento explica o **porquê** dos arquivos abaixo, para quem (humano ou
agente) for integrá-los ao harness que já existe neste repositório. Não é um
manual de instalação — é o contexto de decisão, pra evitar que a integração
quebre a intenção original ao adaptar para o que já está montado.

Arquivos:

- `.github/workflows/agent-planning.yml`
- `.github/workflows/agent-implement.yml`
- `.claude/prompts/planning-agent.md`

## Problema que isso resolve

Toda issue criada hoje precisa de atenção humana pra virar um plano de
implementação, mesmo quando o escopo é óbvio e de baixo risco. Isso consome
tempo de planejamento em tarefas que não precisariam disso. A ideia é
**separar a decisão "isso pode ser automatizado?" da execução em si**, e só
pedir humano quando o próprio agente reconhece que não tem confiança
suficiente.

## Por que duas etapas separadas (planejar ≠ implementar)

Não é só organização — é uma fronteira de segurança:

- O agente de planejamento roda com `--allowedTools "Read,Grep,Glob"`: ele
  **não pode editar nada**, só ler o repositório e devolver um plano em JSON.
- O agente de implementação só existe depois que um plano foi aprovado
  (`confidence: "high"` do próprio agente, ou aprovação manual). Só nessa
  etapa ele ganha `Edit,Write,Bash`.

Se o harness existente já tem um único agente fazendo tudo de uma vez, vale
avaliar se dá pra manter essa separação — ela é o que permite confiar em
automação total nos casos simples sem abrir mão de controle nos casos
arriscados.

## Onde a decisão acontece

O roteamento (auto-implementar vs. voltar pra humano) é feito pelo próprio
agente de planejamento, através do campo `confidence` que ele é instruído a
preencher em `.claude/prompts/planning-agent.md`. Os critérios de quando
`confidence` deve ser `"high"` estão explícitos nesse prompt — é o lugar
certo pra ajustar o quão conservador o sistema é (por exemplo, forçar
`aguarda-humano` sempre que `risk_level` for `"high"`, mesmo com confiança
alta).

Isso significa: **não tente replicar essa lógica de decisão em outro lugar**
(ex: um script separado analisando a issue). O julgamento de
"consigo planejar isso com segurança?" deve continuar vindo do próprio
agente que leu o código, não de um heurística externa cega ao contexto.

## Pontos de integração com o harness existente

Ao adaptar estes arquivos pro que já está montado no repo, preservar:

1. **A separação de tools por etapa** (read-only no planejamento, write no
   implementação) — é a parte que não deveria ser simplificada.
2. **O formato JSON estruturado da saída do planejamento** — outras partes
   do pipeline (comentário na issue, labels, movimentação no Project)
   dependem desse contrato. Se o harness já tem um jeito diferente de
   estruturar saída de agentes, pode substituir o schema, mas mantenha
   `confidence` (ou equivalente) como campo que dirige o roteamento.
3. **O rastro na issue** (comentário com o plano) — é o que permite que um
   humano audite ou retome o trabalho do agente de implementação depois,
   mesmo sem ver os logs do workflow.

Pontos que são só exemplo e podem ser trocados livremente pelo padrão já
usado no harness: nomes de labels, forma de mover o item no GitHub Project,
CLI específica usada para chamar o modelo (aqui foi usado `claude --print`
como no piloto atual, mas se o harness já tem um wrapper próprio, usar o
wrapper).

## O que NÃO está resolvido nestes arquivos

- Não há retry automático se o agente de implementação falhar no meio.
- Não há limite de quantas issues podem ser processadas em paralelo.
- O "aguarda-humano" não notifica ninguém ativamente, só muda a label —
  se o harness já tem um canal de notificação (Slack, etc.), esse é um
  ponto óbvio pra conectar.

Esses foram deixados de fora de propósito, para o piloto continuar simples
enquanto ainda está sendo validado por task (tempo gasto, retrabalho,
qualidade), antes de justificar automação adicional em cima disso.

## Decisão: labels disparam, Project só reflete

O Project usado (`github.com/users/19950512/projects/10`) é um **Project de
usuário**, não de organização. O evento `projects_v2_item`, que permitiria o
Actions disparar diretamente quando alguém move um card de coluna, só está
disponível para Projects de organização — a documentação oficial do GitHub é
explícita: "Availability: organization". Ou seja, não dá pra usar o board
como gatilho nativo aqui.

Por isso o desenho final é:

- **Gatilho real:** labels na issue (`precisa-plano`, `pronto-implementar`).
  O suporte aplica `precisa-plano` manualmente ao abrir o ticket.
- **Board:** os próprios agentes atualizam o campo "Status" do Project via
  GraphQL (`.github/scripts/set-project-status.sh`) em cada etapa —
  Planejando, Pronto p/ Implementar, Em Implementação, Em Revisão, Aguardando
  Humano. É um espelho visual, não a fonte da automação.

Se no futuro o Project for migrado para uma organização, dá pra trocar o
gatilho por `on: projects_v2_item` de verdade e usar o board como fonte única
— mas isso exige criar uma organização e mover/recriar o Project.
