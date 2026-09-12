"use client";

import { useCallback, useEffect, useState } from "react";
import { approveJobPosting, listPendingModeration, rejectJobPosting } from "../../lib/api/admin";
import { ApiRequestError } from "../../lib/api/client";
import { JobPostingInternalView } from "../../lib/api/job-postings";
import { useAuth } from "../../lib/auth/auth-context";
import { RequireRole } from "../../lib/auth/require-role";
import { formatBRL } from "../../lib/format";

function ModerationQueueItem({
  jobPosting,
  token,
  onDecided,
}: {
  jobPosting: JobPostingInternalView;
  token: string;
  onDecided: () => void;
}): JSX.Element {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await approveJobPosting(token, jobPosting.id);
      onDecided();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível aprovar a vaga");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(): Promise<void> {
    if (reason.trim().length < 3) {
      setError("Informe um motivo com pelo menos 3 caracteres");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await rejectJobPosting(token, jobPosting.id, reason);
      onDecided();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Não foi possível rejeitar a vaga");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">{jobPosting.title}</h3>
      <p className="text-muted">{jobPosting.location}</p>
      <p className="text-muted">
        {formatBRL(jobPosting.salaryRangeCents.min)} - {formatBRL(jobPosting.salaryRangeCents.max)} · empresa{" "}
        {jobPosting.companyId}
      </p>
      <p>{jobPosting.description}</p>
      <p className="text-muted">Requisitos: {jobPosting.requirements}</p>

      {error && <p className="error-message">{error}</p>}

      <div className="button-row">
        <button className="button" disabled={busy} onClick={handleApprove}>
          Aprovar
        </button>
      </div>

      <div className="form-field" style={{ marginTop: "0.75rem" }}>
        <label htmlFor={`reason-${jobPosting.id}`}>Motivo da rejeição</label>
        <textarea
          id={`reason-${jobPosting.id}`}
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <button className="button button-danger" disabled={busy} onClick={handleReject}>
        Rejeitar
      </button>
    </div>
  );
}

function ModerationQueue(): JSX.Element {
  const { token } = useAuth();
  const [jobPostings, setJobPostings] = useState<JobPostingInternalView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    listPendingModeration(token)
      .then(setJobPostings)
      .catch((err: unknown) => setError(err instanceof ApiRequestError ? err.message : "Erro ao carregar fila"));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="stack">
      <h1>Fila de moderação</h1>
      {error && <p className="error-message">{error}</p>}
      {jobPostings === null && !error && <p className="text-muted">Carregando...</p>}
      {jobPostings && jobPostings.length === 0 && <p className="text-muted">Nenhuma vaga pendente de moderação.</p>}

      <div className="job-list">
        {jobPostings?.map((jobPosting) =>
          token ? (
            <ModerationQueueItem key={jobPosting.id} jobPosting={jobPosting} token={token} onDecided={load} />
          ) : null,
        )}
      </div>
    </div>
  );
}

export default function ModerationQueuePage(): JSX.Element {
  return (
    <RequireRole role="ADMIN" redirectTo="/admin/login">
      <ModerationQueue />
    </RequireRole>
  );
}
