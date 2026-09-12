"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWalletBalance, WalletBalance } from "../../lib/api/credit";
import { ApiRequestError } from "../../lib/api/client";
import { useAuth } from "../../lib/auth/auth-context";
import { RequireRole } from "../../lib/auth/require-role";

function WorkerDashboard(): JSX.Element {
  const { token } = useAuth();
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getWalletBalance(token)
      .then(setWallet)
      .catch((err: unknown) => setError(err instanceof ApiRequestError ? err.message : "Erro ao carregar saldo"));
  }, [token]);

  return (
    <div className="stack">
      <h1>Meu painel</h1>

      <div className="card">
        <h3 className="card-title">Saldo de créditos</h3>
        {error && <p className="error-message">{error}</p>}
        {wallet && <p style={{ fontSize: "2rem", margin: 0 }}>{wallet.balance}</p>}
        <div className="button-row" style={{ marginTop: "1rem" }}>
          <Link className="button" href="/painel/creditos">
            Comprar créditos
          </Link>
          <Link className="button button-secondary" href="/painel/desbloqueios">
            Ver histórico de desbloqueios
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Encontre vagas</h3>
        <p className="text-muted">Navegue pelo catálogo público e desbloqueie as vagas de seu interesse.</p>
        <Link className="button button-secondary" href="/">
          Ver vagas
        </Link>
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
