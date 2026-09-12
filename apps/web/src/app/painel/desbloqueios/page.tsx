"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      .catch((err: unknown) => setError(err instanceof ApiRequestError ? err.message : "Erro ao carregar histórico"));
  }, [token]);

  return (
    <div className="stack">
      <h1>Vagas desbloqueadas</h1>
      {error && <p className="error-message">{error}</p>}
      {items === null && !error && <p className="text-muted">Carregando...</p>}
      {items && items.length === 0 && <p className="text-muted">Você ainda não desbloqueou nenhuma vaga.</p>}

      <div className="job-list">
        {items?.map((item) => (
          <Link key={item.jobPostingId} href={`/vagas/${item.jobPostingId}`} className="card">
            <h3 className="card-title">{item.jobPostingTitle ?? "Vaga removida"}</h3>
            <p className="text-muted">
              {item.creditsSpent} créditos · desbloqueada em {formatDate(item.unlockedAt)}
            </p>
          </Link>
        ))}
      </div>
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
