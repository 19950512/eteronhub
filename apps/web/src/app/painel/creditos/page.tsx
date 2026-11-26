"use client";

import {
  ArrowLeft,
  Check,
  CircleCheck,
  Clock,
  Coins,
  Copy,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageHeader } from "../../../components/ui/page-header";
import { Spinner } from "../../../components/ui/spinner";
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

function CopyPixCode({ code }: { code: string }): JSX.Element {
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-primary btn-lg btn-block"
      onClick={handleCopy}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Código copiado!" : "Copiar código Pix"}</span>
    </button>
  );
}

function BuyCredits(): JSX.Element {
  const { token } = useAuth();
  const [packages, setPackages] = useState<CreditPackageView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
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
      .catch((err: unknown) =>
        setError(
          err instanceof ApiRequestError ? err.message : "Erro ao carregar pacotes",
        ),
      );
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
    setBuyingId(creditPackageId);
    try {
      const result = await createPixCharge(token, creditPackageId);
      setCharge(result);
      setStatus("PENDING");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Não foi possível gerar a cobrança Pix",
      );
    } finally {
      setBuyingId(null);
    }
  }

  function resetCharge(): void {
    setCharge(null);
    setStatus(null);
  }

  if (charge) {
    return (
      <div className="container page">
        <div className="card pix-card">
          {status === "CONFIRMED" && (
            <>
              <span
                className="icon-tile icon-tile-lg"
                style={{
                  color: "var(--color-success)",
                  background: "var(--color-success-soft)",
                }}
              >
                <CircleCheck aria-hidden="true" />
              </span>
              <h1>Pagamento confirmado!</h1>
              <p className="text-muted">
                Seus créditos já estão na carteira. Bora desbloquear vagas?
              </p>
              <div className="stack" style={{ width: "100%" }}>
                <Link href="/vagas" className="btn btn-primary btn-lg btn-block">
                  Ver vagas
                </Link>
                <Link href="/painel" className="btn btn-secondary btn-block">
                  Ir para o painel
                </Link>
              </div>
            </>
          )}

          {status === "EXPIRED" && (
            <>
              <span className="icon-tile icon-tile-lg">
                <Clock aria-hidden="true" />
              </span>
              <h1>Cobrança expirada</h1>
              <p className="text-muted">
                O prazo para pagar este Pix acabou. Gere uma nova cobrança para continuar.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={resetCharge}
              >
                Escolher pacote novamente
              </button>
            </>
          )}

          {status === "PENDING" && (
            <>
              <div className="stack-sm" style={{ alignItems: "center" }}>
                <span className="eyebrow">
                  <QrCode aria-hidden="true" size={14} />
                  Pagamento via Pix
                </span>
                <h1>Escaneie o QR code</h1>
                <p className="text-muted text-sm">
                  Abra o app do seu banco, escolha pagar com Pix e aponte a câmera — ou
                  copie o código abaixo.
                </p>
              </div>
              <img
                src={charge.qrCodeImageBase64}
                alt="QR code para pagamento via Pix"
                className="qr-code"
              />
              <p className="copy-code" aria-label="Código Pix copia e cola">
                {charge.qrCode}
              </p>
              <CopyPixCode code={charge.qrCode} />
              <div className="cluster text-sm text-muted" role="status">
                <span className="pulse-dot" aria-hidden="true" />
                Aguardando confirmação do pagamento...
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={resetCharge}
              >
                <ArrowLeft aria-hidden="true" />
                Escolher outro pacote
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Carteira"
        title="Comprar créditos"
        description="Use créditos para desbloquear o contato das empresas. O pagamento é feito via Pix, pelo app do seu banco."
      />

      <div className="stack-lg">
        {error && <Alert tone="error">{error}</Alert>}

        {packages === null && !error && (
          <div className="grid-3" role="status" aria-label="Carregando pacotes">
            {[0, 1, 2].map((index) => (
              <div key={index} className="card stack" aria-hidden="true">
                <span className="skeleton" style={{ height: 16, width: "40%" }} />
                <span className="skeleton" style={{ height: 40, width: "55%" }} />
                <span className="skeleton" style={{ height: 44 }} />
              </div>
            ))}
          </div>
        )}

        {packages && packages.length === 0 && (
          <EmptyState
            icon={Coins}
            title="Nenhum pacote disponível"
            description="Tente novamente em alguns minutos."
          />
        )}

        {packages && packages.length > 0 && (
          <div className="grid-3">
            {packages.map((pack) => (
              <article className="card package-card" key={pack.id}>
                <div className="stack-sm">
                  <h2 className="card-title" style={{ margin: 0 }}>
                    {pack.name}
                  </h2>
                  <p className="package-credits">
                    <strong>{pack.creditsAmount}</strong> créditos
                  </p>
                  <p className="package-price">{formatBRL(pack.priceCents)}</p>
                </div>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => handleBuy(pack.id)}
                  disabled={buyingId !== null}
                >
                  {buyingId === pack.id ? <Spinner /> : <QrCode aria-hidden="true" />}
                  {buyingId === pack.id ? "Gerando Pix..." : "Pagar com Pix"}
                </button>
              </article>
            ))}
          </div>
        )}

        <div
          className="cluster text-sm text-muted"
          style={{ flexWrap: "nowrap", alignItems: "flex-start" }}
        >
          <ShieldCheck
            aria-hidden="true"
            size={18}
            style={{ flex: "none", marginTop: 2 }}
          />
          <span>
            Pagamento processado pelo Banco Inter. Os créditos entram na carteira assim
            que o Pix é confirmado.
          </span>
        </div>
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
