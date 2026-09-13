### Plano gerado pelo agente

**Resumo:** Adicionar um comentário HTML de uma linha no topo do README.md descrevendo o que é o Eteron Hub, sem alterar nenhum outro conteúdo do arquivo.

**Confiança:** high
**Risco:** low

**Passos:**

- Abrir README.md na raiz do repositório (o arquivo existe, com 25 linhas, começando pelo heading `# Eteron Hub` na linha 1).
- Inserir na linha 1 um comentário HTML de uma única linha, por exemplo: `<!-- Eteron Hub: marketplace B2B de metalurgia e estruturas metálicas que conecta empresas a trabalhadores via vagas anônimas moderadas e créditos Pix. -->`, seguido de uma linha em branco antes do `# Eteron Hub` existente.
- Manter o texto do comentário em português, coerente com o restante do README, e resumir o projeto em uma única frase.
- Não alterar mais nenhuma linha do arquivo: o heading, as seções `## Documentação` e `## Stack` e os links para `docs/` permanecem idênticos.
- Rodar `pnpm format:check` (ou `pnpm format` e conferir o diff) para garantir que o Prettier — que roda em `*.md` via lint-staged e no CI — não reformata o arquivo; o comentário HTML é preservado verbatim, mas manter a linha dentro do espírito do `printWidth: 90` evita ruído.
- Commitar apenas a alteração em README.md.

**Arquivos afetados:**

- `README.md`
