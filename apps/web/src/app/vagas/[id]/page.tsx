"use client";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ExternalLink,
  LockKeyhole,
  LockOpen,
  Mail,
  MapPin,
  Phone,
  SearchX,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "../../../components/ui/alert";
import { EmptyState } from "../../../components/ui/empty-state";
import { PageLoading, Spinner } from "../../../components/ui/spinner";
import { ApiRequestError } from "../../../lib/api/client";
import {
  getJobPostingDetails,
  JobPostingPublicView,
  JobPostingUnlockedView,
} from "../../../lib/api/job-postings";
import { unlockJobPosting } from "../../../lib/api/job-unlock";
import { useAuth } from "../../../lib/auth/auth-context";
import { formatDate, formatSalaryRange } from "../../../lib/format";

function isUnlocked(
  view: JobPostingPublicView | JobPostingUnlockedView,
): view is JobPostingUnlockedView {
  return "companyName" in view;
}

function ContactCard({
  jobPosting,
}: {
  jobPosting: JobPostingUnlockedView;
}): JSX.Element {
  const { email, phone, applicationUrl } = jobPosting.contactInfo;
  return (
    <div className="card stack" id="contato">
      <div className="cluster">
        <span className="icon-tile">
          <LockOpen aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow" style={{ color: "var(--color-success)" }}>
            Vaga desbloqueada
          </p>
          <h2 className="card-title" style={{ margin: 0 }}>
            {jobPosting.companyName}
          </h2>
        </div>
      </div>
      <div className="contact-actions">
        {phone && (
          <a
            className="btn btn-primary btn-block"
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          >
            <Phone aria-hidden="true" />
            Ligar: {phone}
          </a>
        )}
        {email && (
          <a
            className="btn btn-secondary btn-block break-anywhere"
            href={`mailto:${email}`}
          >
            <Mail aria-hidden="true" />
            {email}
          </a>
        )}
        {applicationUrl && (
          <a
            className="btn btn-secondary btn-block"
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink aria-hidden="true" />
            Candidatar-se pelo site
          </a>
        )}
      </div>
      <p className="text-xs text-muted">
        Diga que encontrou a vaga no Eteron Hub. Nunca pague taxas para participar de
        processos seletivos.
      </p>
    </div>
  );
}

export default function JobPostingDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { token, payload, isLoading: authLoading } = useAuth();
  const [jobPosting, setJobPosting] = useState<
    JobPostingPublicView | JobPostingUnlockedView | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // Espera a sessão hidratar (leitura do token no localStorage) antes de
    // buscar o detalhe — do contrário a primeira requisição sai sem
    // Authorization e, se resolver depois da requisição autenticada, pode
    // sobrescrever o resultado correto com a versão anônima/404.
    if (authLoading) return;

    let cancelled = false;
    setError(null);
    getJobPostingDetails(id, token ?? undefined)
      .then((result) => {
        if (!cancelled) setJobPosting(result);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof ApiRequestError ? err.message : "Vaga não encontrada");
      });

    return () => {
      cancelled = true;
    };
  }, [id, token, authLoading, reloadCount]);

  async function handleUnlock(): Promise<void> {
    if (!token) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      await unlockJobPosting(token, id);
      setReloadCount((count) => count + 1);
    } catch (err) {
      setUnlockError(
        err instanceof ApiRequestError
          ? err.message
          : "Não foi possível desbloquear a vaga",
      );
    } finally {
      setUnlocking(false);
    }
  }

  if (error) {
    return (
      <div className="container page">
        <EmptyState
          icon={SearchX}
          title="Vaga indisponível"
          description={`${error}. Ela pode ter sido encerrada ou expirado.`}
          action={
            <Link href="/vagas" className="btn btn-primary">
              Ver outras vagas
            </Link>
          }
        />
      </div>
    );
  }

  if (!jobPosting) {
    return <PageLoading label="Carregando vaga..." />;
  }

  const unlocked = isUnlocked(jobPosting);
  const isWorker = payload?.role === "WORKER";
  const unlockLabel = unlocking
    ? "Desbloqueando..."
    : `Desbloquear por ${jobPosting.unlockCost} créditos`;

  const unlockCard = (
    <div className="card stack" id="desbloquear">
      <div className="cluster">
        <span className="icon-tile">
          <LockKeyhole aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">Empresa oculta</p>
          <h2 className="card-title" style={{ margin: 0 }}>
            Veja quem está contratando
          </h2>
        </div>
      </div>
      <div className="locked-preview" aria-hidden="true">
        <span className="locked-line" style={{ width: "70%" }} />
        <span className="locked-line" style={{ width: "50%" }} />
        <span className="locked-line" style={{ width: "60%" }} />
      </div>
      <p className="text-sm text-muted">
        Desbloqueie por <strong>{jobPosting.unlockCost} créditos</strong> para ver o nome
        da empresa, telefone, e-mail e link de candidatura.
      </p>
      {unlockError && (
        <Alert tone="error">
          {unlockError} <Link href="/painel/creditos">Comprar créditos</Link>
        </Alert>
      )}
      {isWorker ? (
        <>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleUnlock}
            disabled={unlocking}
          >
            {unlocking ? <Spinner /> : <LockOpen aria-hidden="true" />}
            {unlockLabel}
          </button>
          <Link href="/painel/creditos" className="btn btn-ghost btn-block">
            <Wallet aria-hidden="true" />
            Comprar créditos
          </Link>
        </>
      ) : (
        <>
          <Link href="/login" className="btn btn-primary btn-lg btn-block">
            Entrar como trabalhador
          </Link>
          <Link href="/cadastro/trabalhador" className="btn btn-secondary btn-block">
            Criar conta
          </Link>
        </>
      )}
    </div>
  );

  return (
    <div className="container page">
      <Link
        href="/vagas"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: "var(--space-4)", marginLeft: -12 }}
      >
        <ArrowLeft aria-hidden="true" />
        Todas as vagas
      </Link>

      <div className="with-sidebar">
        <article className="card stack-lg">
          <header className="job-detail-header">
            <div className="cluster">
              {unlocked ? (
                <span className="badge badge-success">Desbloqueada</span>
              ) : (
                <span className="chip">
                  <LockKeyhole aria-hidden="true" />
                  Empresa oculta
                </span>
              )}
            </div>
            <h1 className="break-anywhere">{jobPosting.title}</h1>
            <div className="meta-row">
              {unlocked && (
                <span>
                  <Building2 aria-hidden="true" />
                  {jobPosting.companyName}
                </span>
              )}
              <span>
                <MapPin aria-hidden="true" />
                {jobPosting.location}
              </span>
              {jobPosting.publishedAt && (
                <span>
                  <CalendarClock aria-hidden="true" />
                  Publicada em {formatDate(jobPosting.publishedAt)}
                </span>
              )}
            </div>
            <div className="salary-block">
              <span className="text-xs text-muted">Faixa salarial</span>
              <strong>{formatSalaryRange(jobPosting.salaryRangeCents)}</strong>
            </div>
          </header>

          <section className="prose">
            <h2>Descrição</h2>
            <p className="pre-line">{jobPosting.description}</p>
          </section>

          <section className="prose">
            <h2>Requisitos</h2>
            <p className="pre-line">{jobPosting.requirements}</p>
          </section>
        </article>

        <aside className="stack">
          {unlocked ? <ContactCard jobPosting={jobPosting} /> : unlockCard}
        </aside>
      </div>

      {!unlocked && (
        <div className="mobile-action-bar" style={{ marginTop: "var(--space-6)" }}>
          <div>
            <p className="text-xs" style={{ color: "var(--steel-300)" }}>
              Contato da empresa
            </p>
            <p style={{ fontWeight: 700 }}>{jobPosting.unlockCost} créditos</p>
          </div>
          {isWorker ? (
            <button
              className="btn btn-primary"
              onClick={handleUnlock}
              disabled={unlocking}
            >
              {unlocking ? <Spinner /> : <LockOpen aria-hidden="true" />}
              Desbloquear
            </button>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Entrar
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
