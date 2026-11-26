"use client";

import { ArrowRight, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "../../components/ui/alert";
import { PageHeader } from "../../components/ui/page-header";
import { getWalletBalance, WalletBalance } from "../../lib/api/credit";
import { ApiRequestError } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/auth-context";
import { RequireRole } from "../../lib/auth/require-role";
import { formatDate } from "../../lib/format";

const SHORTCUTS = [
  {
    href: "/vagas",
    title: "Buscar vagas",
    description: "Filtre por cidade e encontre oportunidades abertas.",
  },
  {
    href: "/painel/desbloqueios",
    title: "Vagas desbloqueadas",
    description: "Reveja o contato das empresas que você já desbloqueou.",
  },
  {
    href: "/painel/creditos",
    title: "Comprar créditos",
    description: "Pague via Pix e use os créditos para desbloquear vagas.",
  },
];

function WorkerDashboard(): JSX.Element {
  const { token } = useAuth();
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getWalletBalance(token)
      .then(setWallet)
      .catch((err: unknown) =>
        setError(err instanceof ApiRequestError ? err.message : "Erro ao carregar saldo"),
      );
  }, [token]);

  return (
    <div className="container page">
      <PageHeader eyebrow="Área do trabalhador" title="Meu painel" />

      <div className="stack-lg">
        <section
          className="card card-inverse balance-card"
          aria-labelledby="saldo-titulo"
        >
          <div className="cluster-between">
            <h2
              id="saldo-titulo"
              className="stat-label"
              style={{ color: "var(--steel-300)" }}
            >
              Saldo de créditos
            </h2>
            <Wallet aria-hidden="true" color="var(--spark-400)" />
          </div>
          {error ? (
            <Alert tone="error">{error}</Alert>
          ) : (
            <div className="balance-value" aria-live="polite">
              {wallet ? (
                <strong>{wallet.balance}</strong>
              ) : (
                <span
                  className="skeleton"
                  style={{ width: 96, height: 56, opacity: 0.3 }}
                />
              )}
              <span>créditos</span>
            </div>
          )}
          {wallet && (
            <p className="text-xs text-muted">
              Atualizado em {formatDate(wallet.updatedAt)}
            </p>
          )}
          <div className="cluster">
            <Link className="btn btn-primary" href="/painel/creditos">
              <Plus aria-hidden="true" />
              Comprar créditos
            </Link>
            <Link className="btn btn-on-dark" href="/vagas">
              Usar créditos em vagas
            </Link>
          </div>
        </section>

        <section className="grid-3" aria-label="Atalhos">
          {SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="card card-interactive stack"
            >
              <div className="stack-sm">
                <h3>{shortcut.title}</h3>
                <p className="text-sm text-muted">{shortcut.description}</p>
              </div>
              <span className="job-card-cta">
                Acessar
                <ArrowRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

export default function WorkerDashboardPage(): JSX.Element {
  return (
    <RequireRole role="WORKER" redirectTo="/login">
      <WorkerDashboard />
    </RequireRole>
  );
}
