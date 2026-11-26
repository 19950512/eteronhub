"use client";

import { ChevronRight, History, LockOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/ui/page-header";
import { ApiRequestError } from "../../../lib/api/client";
import { JobUnlockHistoryItem, listWorkerJobUnlocks } from "../../../lib/api/job-unlock";
import { useAuth } from "../../../lib/auth/auth-context";
import { RequireRole } from "../../../lib/auth/require-role";
import { formatDate } from "../../../lib/format";

function UnlockHistory(): JSX.Element {
  const { token } = useAuth();
  const [items, setItems] = useState<JobUnlockHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listWorkerJobUnlocks(token)
      .then(setItems)
      .catch((err: unknown) =>
        setError(
          err instanceof ApiRequestError ? err.message : "Erro ao carregar histórico",
        ),
      );
  }, [token]);

  return (
    <div className="container page container-narrow">
      <PageHeader
        eyebrow="Histórico"
        title="Vagas desbloqueadas"
        description="Toque em uma vaga para ver de novo o contato da empresa."
      />

      {error && <Alert tone="error">{error}</Alert>}

      {items === null && !error && (
        <div className="card" role="status" aria-label="Carregando histórico">
          {[0, 1, 2].map((index) => (
            <div key={index} className="list-item" aria-hidden="true">
              <span
                className="skeleton"
                style={{ width: 44, height: 44, borderRadius: 12 }}
              />
              <div className="list-item-body stack-sm">
                <span className="skeleton" style={{ height: 16, width: "70%" }} />
                <span className="skeleton" style={{ height: 12, width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState
          icon={History}
          title="Nenhuma vaga desbloqueada ainda"
          description="Quando você desbloquear uma vaga, o contato da empresa fica salvo aqui."
          action={
            <Link href="/vagas" className="btn btn-primary">
              Buscar vagas
            </Link>
          }
        />
      )}

      {items && items.length > 0 && (
        <ul className="card list" style={{ paddingBlock: "var(--space-2)" }}>
          {items.map((item) => (
            <li key={item.jobPostingId}>
              <Link href={`/vagas/${item.jobPostingId}`} className="list-item">
                <span className="icon-tile">
                  <LockOpen aria-hidden="true" />
                </span>
                <div className="list-item-body">
                  <p className="list-item-title">
                    {item.jobPostingTitle ?? "Vaga removida"}
                  </p>
                  <p className="text-xs text-muted">
                    {item.creditsSpent} créditos · desbloqueada em{" "}
                    {formatDate(item.unlockedAt)}
                  </p>
                </div>
                <ChevronRight aria-hidden="true" size={20} className="text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function UnlockHistoryPage(): JSX.Element {
  return (
    <RequireRole role="WORKER" redirectTo="/login">
      <UnlockHistory />
    </RequireRole>
  );
}
