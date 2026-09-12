"use client";

import { useEffect, useRef, useState } from "react";
import { ApiRequestError } from "../../../lib/api/client";
import {
  createPixCharge,
  CreditPackageView,
  getPaymentStatus,
  listCreditPackages,
  PaymentStatus,
} from "../../../lib/api/payments";
import { useAuth } from "../../../lib/auth/auth-context";
import { RequireRole } from "../../../lib/auth/require-role";
import { formatBRL } from "../../../lib/format";

const POLL_INTERVAL_MS = 4000;

function BuyCredits(): JSX.Element {
  const { token } = useAuth();
  const [packages, setPackages] = useState<CreditPackageView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [charge, setCharge] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeImageBase64: string;
  } | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    listCreditPackages()
      .then(setPackages)
      .catch((err: unknown) => setError(err instanceof ApiRequestError ? err.message : "Erro ao carregar pacotes"));
  }, []);

  useEffect(() => {
    if (!token || !charge || !status || status !== "PENDING") return;

    pollRef.current = setInterval(async () => {
      try {
        const result = await getPaymentStatus(token, charge.paymentId);
        setStatus(result.status);
        if (result.status !== "PENDING" && pollRef.current) {
          clearInterval(pollRef.current);
        }
      } catch {
        // Tenta de novo no próximo tick.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token, charge, status]);

  async function handleBuy(creditPackageId: string): Promise<void> {
    if (!token) return;
    setError(null);
    try {
      const result = await createPixCharge(token, creditPackageId);
      setCharge(result);
      setStatus("PENDING");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível gerar a cobrança Pix");
    }
  }

  if (charge) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
        <h1>Pagar com Pix</h1>
        {status === "CONFIRMED" && (
          <p className="success-message">Pagamento confirmado! Seus créditos já foram adicionados.</p>
        )}
        {status === "EXPIRED" && <p className="error-message">Esta cobrança expirou. Gere uma nova.</p>}
        {status === "PENDING" && (
          <>
            <img src={charge.qrCodeImageBase64} alt="QR Code Pix" className="qr-code" />
            <p className="text-muted">Escaneie o QR code ou copie o código abaixo no app do seu banco.</p>
            <p className="copy-code">{charge.qrCode}</p>
            <p className="text-muted">Aguardando confirmação do pagamento...</p>
          </>
        )}
        <button
          className="button button-secondary"
          onClick={() => {
            setCharge(null);
            setStatus(null);
          }}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      <h1>Comprar créditos</h1>
      {error && <p className="error-message">{error}</p>}
      {packages === null && !error && <p className="text-muted">Carregando pacotes...</p>}

      <div className="job-list">
        {packages?.map((pack) => (
          <div className="card" key={pack.id}>
            <h3 className="card-title">{pack.name}</h3>
            <p>{formatBRL(pack.priceCents)}</p>
            <button className="button" onClick={() => handleBuy(pack.id)}>
              Comprar via Pix
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BuyCreditsPage(): JSX.Element {
  return (
    <RequireRole role="WORKER" redirectTo="/login">
      <BuyCredits />
    </RequireRole>
  );
}
