import type { ReactNode } from "react";
import { LEGAL_DOCUMENTS_EFFECTIVE_DATE } from "../../lib/legal";

interface LegalPageProps {
  title: string;
  version: string;
  summary: ReactNode;
  children: ReactNode;
}

export function LegalPage({
  title,
  version,
  summary,
  children,
}: LegalPageProps): JSX.Element {
  return (
    <article className="container container-narrow page legal">
      <header className="legal-header">
        <h1>{title}</h1>
        <p className="text-sm text-muted">
          Versão {version} · em vigor desde {LEGAL_DOCUMENTS_EFFECTIVE_DATE}
        </p>
      </header>
      <aside className="legal-summary" aria-label="Resumo">
        <h2>Em resumo</h2>
        {summary}
      </aside>
      <div className="legal-body">{children}</div>
    </article>
  );
}
