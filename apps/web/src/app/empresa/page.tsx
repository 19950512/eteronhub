"use client";

import { BriefcaseBusiness, MapPin, Pencil, Plus, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "../../components/ui/alert";
import { EmptyState } from "../../components/ui/empty-state";
import { PageHeader } from "../../components/ui/page-header";
import { Spinner } from "../../components/ui/spinner";
import { StatusBadge } from "../../components/ui/status-badge";
import { ApiRequestError } from "../../lib/api/client";
import {
  closeJobPosting,
  JobPostingInternalView,
  JobPostingStatus,
  listCompanyJobPostings,
  submitJobPostingForModeration,
} from "../../lib/api/job-postings";
import { useAuth } from "../../lib/auth/auth-context";
import { RequireRole } from "../../lib/auth/require-role";
import { formatDate, formatSalaryRange } from "../../lib/format";

const SUMMARY: { status: JobPostingStatus; label: string }[] = [
  { status: "PUBLISHED", label: "Publicadas" },
  { status: "IN_MODERATION", label: "Em moderação" },
  { status: "DRAFT", label: "Rascunhos" },
  { status: "REJECTED", label: "Rejeitadas" },
];

function CompanyDashboard(): JSX.Element {
  const { token } = useAuth();
  const [jobPostings, setJobPostings] = useState<JobPostingInternalView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    listCompanyJobPostings(token)
      .then(setJobPostings)
      .catch((err: unknown) =>
        setError(err instanceof ApiRequestError ? err.message : "Erro ao carregar vagas"),
      );
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(id: string): Promise<void> {
    if (!token) return;
    setBusyId(id);
    setActionError(null);
    try {
      await submitJobPostingForModeration(token, id);
      load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Não foi possível submeter a vaga",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleClose(id: string): Promise<void> {
    if (!token) return;
    setBusyId(id);
    setActionError(null);
    try {
      await closeJobPosting(token, id);
      load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Não foi possível encerrar a vaga",
      );
    } finally {
      setBusyId(null);
    }
  }

  const newJobButton = (
    <Link className="btn btn-primary" href="/empresa/vagas/nova">
      <Plus aria-hidden="true" />
      Nova vaga
    </Link>
  );

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Área da empresa"
        title="Minhas vagas"
        description="Crie rascunhos, envie para moderação e acompanhe o status de cada vaga."
        actions={newJobButton}
      />

      <div className="stack-lg">
        {jobPostings && jobPostings.length > 0 && (
          <div className="stats-grid">
            {SUMMARY.map((item) => (
              <div key={item.status} className="stat">
                <span className="stat-value">
                  {jobPostings.filter((j) => j.status === item.status).length}
                </span>
                <span className="stat-label">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {error && <Alert tone="error">{error}</Alert>}
        {actionError && <Alert tone="error">{actionError}</Alert>}

        {jobPostings === null && !error && (
          <div className="stack" role="status" aria-label="Carregando vagas">
            {[0, 1].map((index) => (
              <div key={index} className="card stack" aria-hidden="true">
                <span className="skeleton" style={{ height: 22, width: "50%" }} />
                <span className="skeleton" style={{ height: 14, width: "30%" }} />
              </div>
            ))}
          </div>
        )}

        {jobPostings && jobPostings.length === 0 && (
          <EmptyState
            icon={BriefcaseBusiness}
            title="Você ainda não criou nenhuma vaga"
            description="Crie um rascunho, revise os detalhes e envie para moderação. Publicamos assim que for aprovada."
            action={newJobButton}
          />
        )}

        <div className="stack">
          {jobPostings?.map((jobPosting) => (
            <article className="card stack" key={jobPosting.id}>
              <div className="cluster-between" style={{ alignItems: "flex-start" }}>
                <div className="stack-sm" style={{ minWidth: 0, flex: "1 1 240px" }}>
                  <h2 className="job-card-title">{jobPosting.title}</h2>
                  <div className="meta-row">
                    <span>
                      <MapPin aria-hidden="true" />
                      {jobPosting.location}
                    </span>
                    <span>{formatSalaryRange(jobPosting.salaryRangeCents)}</span>
                    <span>Criada em {formatDate(jobPosting.createdAt)}</span>
                  </div>
                </div>
                <StatusBadge status={jobPosting.status} />
              </div>

              {jobPosting.status === "REJECTED" && jobPosting.rejectionReason && (
                <Alert tone="error" title="Motivo da rejeição">
                  {jobPosting.rejectionReason}
                </Alert>
              )}
              {jobPosting.status === "IN_MODERATION" && (
                <Alert tone="warning">
                  Nossa equipe está revisando esta vaga. O status muda aqui assim que a
                  revisão terminar.
                </Alert>
              )}

              {(jobPosting.status === "DRAFT" ||
                jobPosting.status === "REJECTED" ||
                jobPosting.status === "PUBLISHED") && (
                <div className="cluster">
                  {(jobPosting.status === "DRAFT" ||
                    jobPosting.status === "REJECTED") && (
                    <>
                      <button
                        className="btn btn-primary"
                        disabled={busyId === jobPosting.id}
                        onClick={() => handleSubmit(jobPosting.id)}
                      >
                        {busyId === jobPosting.id ? (
                          <Spinner />
                        ) : (
                          <Send aria-hidden="true" />
                        )}
                        Enviar para moderação
                      </button>
                      <Link
                        className="btn btn-secondary"
                        href={`/empresa/vagas/${jobPosting.id}/editar`}
                      >
                        <Pencil aria-hidden="true" />
                        Editar
                      </Link>
                    </>
                  )}
                  {jobPosting.status === "PUBLISHED" && (
                    <>
                      <Link
                        className="btn btn-secondary"
                        href={`/vagas/${jobPosting.id}`}
                      >
                        Ver anúncio
                      </Link>
                      <button
                        className="btn btn-danger-outline"
                        disabled={busyId === jobPosting.id}
                        onClick={() => handleClose(jobPosting.id)}
                      >
                        {busyId === jobPosting.id ? (
                          <Spinner />
                        ) : (
                          <XCircle aria-hidden="true" />
                        )}
                        Encerrar vaga
                      </button>
                    </>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompanyDashboardPage(): JSX.Element {
  return (
    <RequireRole role="COMPANY" redirectTo="/login">
      <CompanyDashboard />
    </RequireRole>
  );
}
