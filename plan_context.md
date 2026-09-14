### Plano gerado pelo agente

**Resumo:** Criar uma página pública estática `/politica-de-privacidade` no app Next.js (apps/web) com um texto genérico de política de privacidade alinhado à LGPD, e adicionar um componente de rodapé global no layout raiz com link para essa página.

**Confiança:** high
**Risco:** low

**Passos:**

- Criar `apps/web/src/app/politica-de-privacidade/page.tsx` como Server Component estático (sem `"use client"`, pois não há estado nem hooks), exportando `export const metadata = { title: "Política de Privacidade | EteronHub", description: "..." }` e um componente default `PoliticaDePrivacidadePage(): JSX.Element` que renderiza `<div className="stack">` com `<h1>Política de Privacidade</h1>`, data de última atualização e as seções em `<section className="card">` usando as classes já existentes (`card-title`, `text-muted`), seguindo o padrão visual de `apps/web/src/app/page.tsx`.
- Escrever o conteúdo genérico em pt-BR (conforme a convenção de textos de usuário em português do AGENTS.md), com as seções: 1) Quem somos e escopo (controlador Eteron Hub, marketplace B2B); 2) Dados que coletamos (cadastro de empresa/trabalhador: nome, e-mail, telefone, CPF/CNPJ, dados de vaga, dados de pagamento via Pix); 3) Finalidades e bases legais (execução de contrato, obrigação legal, legítimo interesse); 4) Compartilhamento com terceiros (instituição financeira para processamento Pix, provedores de infraestrutura) e a regra de negócio de que os dados de contato da empresa só são revelados ao trabalhador após o desbloqueio pago; 5) Cookies e tecnologias similares (armazenamento local do token de sessão); 6) Retenção e segurança (HTTPS, controle de acesso, não-logging de CPF/CNPJ em plaintext, conforme docs/03-arquitetura-tecnica.md §7); 7) Direitos do titular pela LGPD (acesso, correção, exclusão, portabilidade, revogação); 8) Canal de contato do titular usando o placeholder `privacidade@eteronhub.com`; 9) Alterações desta política. Incluir aviso explícito de que se trata de um texto genérico/modelo, pendente de revisão jurídica antes do lançamento.
- Criar `apps/web/src/components/footer.tsx` exportando `export function Footer(): JSX.Element` — Server Component estático (sem `"use client"`, diferente de `header.tsx` que precisa por usar `useAuth`), renderizando `<footer className="footer">` com `<div className="footer-inner">`: linha de copyright (`© {new Date().getFullYear()} EteronHub`) e uma `<nav className="footer-links">` com `<Link href="/politica-de-privacidade">Política de Privacidade</Link>` via `next/link`.
- Montar o rodapé em `apps/web/src/app/layout.tsx`, adicionando `<Footer />` logo após o `<main>` e dentro do `<AuthProvider>`, com o import relativo `../components/footer` (mesmo estilo do import do `Header`), garantindo que apareça em todas as rotas — inclusive nas públicas e nas autenticadas.
- Adicionar os estilos `.footer`, `.footer-inner` e `.footer-links` ao final de `apps/web/src/app/globals.css`, reutilizando as variáveis CSS existentes (`--color-surface`, `--color-border`, `--color-text-muted`) e espelhando o padrão de `.header`/`.header-inner` (`border-top` em vez de `border-bottom`, `max-width: 960px`, `margin: 0 auto`, `padding: 1rem 1.5rem`, `font-size: 0.85rem`, layout flex responsivo com `flex-wrap: wrap` e `gap`).
- Fazer o rodapé ficar colado na base em páginas curtas: em `globals.css`, aplicar `min-height: 100dvh; display: flex; flex-direction: column;` no `body` e `flex: 1;` em `.main`, verificando que isso não quebra o espaçamento atual (`.main { padding: 2rem 0 4rem; }`) das telas existentes.
- Confirmar que a rota é realmente pública: a página não deve ser envolvida por `require-role.tsx` nem consumir `useAuth`, e não há middleware de rota no app (não existe `apps/web/src/middleware.ts`), portanto nenhum ajuste de autorização é necessário.
- Rodar os checks locais na mesma ordem do CI a partir da raiz do monorepo: `pnpm install`, `pnpm --filter api run prisma:generate`, `pnpm lint`, `pnpm test` e `pnpm --filter web run build`, e validar visualmente com `pnpm --filter web run dev` que `/politica-de-privacidade` abre sem login e que o link do rodapé funciona em todas as páginas.

**Arquivos afetados:**

- `apps/web/src/app/politica-de-privacidade/page.tsx`
- `apps/web/src/components/footer.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
