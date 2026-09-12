"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiRequestError } from "../../lib/api/client";
import {
  closeJobPosting,
  JobPostingInternalView,
  listCompanyJobPostings,
  submitJobPostingForModeration,
} from "../../lib/api/job-postings";
import { useAuth } from "../../lib/auth/auth-context";
import { formatBRL, statusBadgeClass, statusLabel } from "../../lib/format";
import { RequireRole } from "../../lib/auth/require-role";

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
      .catch((err: unknown) => setError(err instanceof ApiRequestError ? err.message : "Erro ao carregar vagas"));
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
      setActionError(err instanceof ApiRequestError ? err.message : "Não foi possível submeter a vaga");
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
      setActionError(err instanceof ApiRequestError ? err.message : "Não foi possível encerrar a vaga");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="stack">
      <div className="button-row" style={{ justifyContent: "space-between" }}>
        <h1>Minhas vagas</h1>
        <Link className="button" href="/empresa/vagas/nova">
          Nova vaga
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}
      {actionError && <p className="error-message">{actionError}</p>}
      {jobPostings === null && !error && <p className="text-muted">Carregando...</p>}
      {jobPostings && jobPostings.length === 0 && <p className="text-muted">Você ainda não criou nenhuma vaga.</p>}

      <div className="job-list">
        {jobPostings?.map((jobPosting) => (
          <div className="card" key={jobPosting.id}>
            <div className="button-row" style={{ justifyContent: "space-between" }}>
              <h3 className="card-title">{jobPosting.title}</h3>
              <span className={`badge ${statusBadgeClass(jobPosting.status)}`}>{statusLabel(jobPosting.status)}</span>
            </div>
            <p className="text-muted">{jobPosting.location}</p>
            <p className="text-muted">
              {formatBRL(jobPosting.salaryRangeCents.min)} - {formatBRL(jobPosting.salaryRangeCents.max)}
            </p>

            {jobPosting.status === "REJECTED" && jobPosting.rejectionReason && (
              <p className="error-message">Motivo da rejeição: {jobPosting.rejectionReason}</p>
            )}

            <div className="button-row">
              {(jobPosting.status === "DRAFT" || jobPosting.status === "REJECTED") && (
                <>
                  <Link className="button button-secondary" href={`/empresa/vagas/${jobPosting.id}/editar`}>
                    Editar
                  </Link>
                  <button
                    className="button"
                    disabled={busyId === jobPosting.id}
                    onClick={() => handleSubmit(jobPosting.id)}
                  >
                    Submeter para moderação
                  </button>
                </>
              )}
              {jobPosting.status === "PUBLISHED" && (
                <button
                  className="button button-danger"
                  disabled={busyId === jobPosting.id}
                  onClick={() => handleClose(jobPosting.id)}
                >
                  Encerrar vaga
                </button>
              )}
            </div>
          </div>
        ))}
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
