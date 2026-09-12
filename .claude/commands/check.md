---
description: Roda lint e testes localmente, na mesma ordem que o CI
---

Rode, nesta ordem, e reporte falhas com o arquivo/linha relevante:

1. `pnpm --filter api run prisma:generate`
2. `pnpm lint`
3. `pnpm test`

Se algum passo falhar, investigue a causa raiz antes de sugerir qualquer
correção — não sugira `--no-verify`, `skip`, ou desabilitar a regra do
ESLint/teste sem justificar por que é seguro.
