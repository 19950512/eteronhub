"use client";

import { useState } from "react";
import { reactivateCompany, reactivateWorker, suspendCompany, suspendWorker } from "../../../lib/api/admin";
import { ApiRequestError } from "../../../lib/api/client";
import { useAuth } from "../../../lib/auth/auth-context";
import { RequireRole } from "../../../lib/auth/require-role";

type AccountKind = "COMPANY" | "WORKER";

function AccountActionCard({ kind }: { kind: AccountKind }): JSX.Element {
  const { token } = useAuth();
  const [id, setId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: (token: string, id: string) => Promise<void>, successMessage: string): Promise<void> {
    if (!token || !id) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await action(token, id);
      setMessage(successMessage);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível concluir a ação");
    } finally {
      setBusy(false);
    }
  }

  const label = kind === "COMPANY" ? "empresa" : "trabalhador";
  const article = kind === "COMPANY" ? "da" : "do";
  const suspend = kind === "COMPANY" ? suspendCompany : suspendWorker;
  const reactivate = kind === "COMPANY" ? reactivateCompany : reactivateWorker;

  return (
    <div className="card">
      <h3 className="card-title">Suspender/reativar {label}</h3>
      <div className="form-field">
        <label htmlFor={`${kind}-id`}>
          ID {article} {label}
        </label>
        <input id={`${kind}-id`} value={id} onChange={(e) => setId(e.target.value)} />
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="button-row">
        <button className="button button-danger" disabled={busy || !id} onClick={() => run(suspend, `${label} suspensa(o)`)}>
          Suspender
        </button>
        <button
          className="button button-secondary"
          disabled={busy || !id}
          onClick={() => run(reactivate, `${label} reativada(o)`)}
        >
          Reativar
        </button>
      </div>
    </div>
  );
}

function AccountManagement(): JSX.Element {
  return (
    <div className="stack">
      <h1>Contas</h1>
      <p className="text-muted">
        Cole o ID retornado no cadastro (ou visto no painel da empresa/trabalhador) para suspender ou reativar uma
        conta.
      </p>
      <AccountActionCard kind="COMPANY" />
      <AccountActionCard kind="WORKER" />
    </div>
  );
}

export default function AccountManagementPage(): JSX.Element {
  return (
    <RequireRole role="ADMIN" redirectTo="/admin/login">
      <AccountManagement />
    </RequireRole>
  );
}
