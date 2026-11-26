"use client";

import { RotateCcw, Ban } from "lucide-react";
import { useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { Field } from "../../../components/ui/field";
import { PageHeader } from "../../../components/ui/page-header";
import {
  reactivateCompany,
  reactivateWorker,
  suspendCompany,
  suspendWorker,
} from "../../../lib/api/admin";
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

  async function run(
    action: (token: string, id: string) => Promise<void>,
    successMessage: string,
  ): Promise<void> {
    if (!token || !id) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await action(token, id);
      setMessage(successMessage);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Não foi possível concluir a ação",
      );
    } finally {
      setBusy(false);
    }
  }

  const label = kind === "COMPANY" ? "empresa" : "trabalhador";
  const article = kind === "COMPANY" ? "da" : "do";
  const suspend = kind === "COMPANY" ? suspendCompany : suspendWorker;
  const reactivate = kind === "COMPANY" ? reactivateCompany : reactivateWorker;

  return (
    <section className="card stack" aria-labelledby={`${kind}-title`}>
      <h2 id={`${kind}-title`} className="card-title" style={{ margin: 0 }}>
        {kind === "COMPANY" ? "Empresas" : "Trabalhadores"}
      </h2>
      <Field id={`${kind}-id`} label={`ID ${article} ${label}`}>
        <input
          id={`${kind}-id`}
          autoComplete="off"
          spellCheck={false}
          style={{ fontFamily: "var(--font-mono)" }}
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </Field>

      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <div className="cluster">
        <button
          className="btn btn-danger"
          disabled={busy || !id}
          onClick={() => run(suspend, `${label} suspensa(o)`)}
        >
          <Ban aria-hidden="true" />
          Suspender
        </button>
        <button
          className="btn btn-secondary"
          disabled={busy || !id}
          onClick={() => run(reactivate, `${label} reativada(o)`)}
        >
          <RotateCcw aria-hidden="true" />
          Reativar
        </button>
      </div>
    </section>
  );
}

function AccountManagement(): JSX.Element {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="Administração"
        title="Contas"
        description="Cole o ID retornado no cadastro (ou visto no painel da empresa/trabalhador) para suspender ou reativar uma conta."
      />
      <div className="grid-2">
        <AccountActionCard kind="COMPANY" />
        <AccountActionCard kind="WORKER" />
      </div>
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
