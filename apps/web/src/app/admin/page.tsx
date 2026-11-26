"use client";

import { Check, ClipboardCheck, LockKeyhole, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "../../components/ui/alert";
import { EmptyState } from "../../components/ui/empty-state";
import { Field } from "../../components/ui/field";
import { PageHeader } from "../../components/ui/page-header";
import { Spinner } from "../../components/ui/spinner";
import {
  approveJobPosting,
  listPendingModeration,
  rejectJobPosting,
} from "../../lib/api/admin";
import { ApiRequestError } from "../../lib/api/client";
import { JobPostingInternalView } from "../../lib/api/job-postings";
import { useAuth } from "../../lib/auth/auth-context";
import { RequireRole } from "../../lib/auth/require-role";
import { formatDate, formatSalaryRange } from "../../lib/format";

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
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(): Promise<void> {
    setBusy("approve");
    setError(null);
    try {
      await approveJobPosting(token, jobPosting.id);
      onDecided();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Não foi possível aprovar a vaga",
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleReject(): Promise<void> {
    if (reason.trim().length < 3) {
      setError("Informe um motivo com pelo menos 3 caracteres");
      return;
    }
    setBusy("reject");
    setError(null);
    try {
      await rejectJobPosting(token, jobPosting.id, reason);
      onDecided();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Não foi possível rejeitar a vaga",
      );
    } finally {
      setBusy(null);
    }
  }

  const { email, phone, applicationUrl } = jobPosting.contactInfo;

  return (
    <article className="card stack">
      <div className="stack-sm">
        <div className="cluster-between" style={{ alignItems: "flex-start" }}>
          <h2 className="job-card-title">{jobPosting.title}</h2>
          <span className="badge badge-warning">Em moderação</span>
        </div>
        <div className="meta-row">
          <span>
            <MapPin aria-hidden="true" />
            {jobPosting.location}
          </span>
          <span>{formatSalaryRange(jobPosting.salaryRangeCents)}</span>
          <span>Criada em {formatDate(jobPosting.createdAt)}</span>
          <span>{jobPosting.unlockCost} créditos</span>
        </div>
        <p className="text-xs text-muted break-anywhere">
          Empresa: {jobPosting.companyId}
        </p>
      </div>

      <div className="card-section prose">
        <h3 className="text-sm">Descrição</h3>
        <p className="pre-line text-sm">{jobPosting.description}</p>
        <h3 className="text-sm">Requisitos</h3>
        <p className="pre-line text-sm">{jobPosting.requirements}</p>
        <h3 className="text-sm">
          <LockKeyhole
            aria-hidden="true"
            size={14}
            style={{ display: "inline", verticalAlign: "-2px" }}
          />{" "}
          Contato (oculto ao público)
        </h3>
        <p className="text-sm break-anywhere">
          {[email, phone, applicationUrl].filter(Boolean).join(" · ") ||
            "Nenhum contato informado"}
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="card-section stack">
        <Field
          id={`reason-${jobPosting.id}`}
          label="Motivo da rejeição"
          hint="Obrigatório apenas para rejeitar. A empresa verá este texto."
        >
          <textarea
            id={`reason-${jobPosting.id}`}
            rows={2}
            aria-describedby={`reason-${jobPosting.id}-hint`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <div className="cluster">
          <button
            className="btn btn-primary"
            disabled={busy !== null}
            onClick={handleApprove}
          >
            {busy === "approve" ? <Spinner /> : <Check aria-hidden="true" />}
            Aprovar e publicar
          </button>
          <button
            className="btn btn-danger-outline"
            disabled={busy !== null}
            onClick={handleReject}
          >
            {busy === "reject" ? <Spinner /> : <X aria-hidden="true" />}
            Rejeitar
          </button>
        </div>
      </div>
    </article>
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
      .catch((err: unknown) =>
        setError(err instanceof ApiRequestError ? err.message : "Erro ao carregar fila"),
      );
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="container container-narrow page">
      <PageHeader
        eyebrow="Administração"
        title="Fila de moderação"
        description={
          jobPostings
            ? `${jobPostings.length} ${jobPostings.length === 1 ? "vaga aguardando" : "vagas aguardando"} revisão.`
            : "Revise as vagas antes de publicá-las."
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {jobPostings === null && !error && (
        <div className="card stack" role="status" aria-label="Carregando fila">
          <span className="skeleton" style={{ height: 22, width: "60%" }} />
          <span className="skeleton" style={{ height: 14, width: "40%" }} />
          <span className="skeleton" style={{ height: 80 }} />
        </div>
      )}
      {jobPostings && jobPostings.length === 0 && (
        <EmptyState
          icon={ClipboardCheck}
          title="Fila zerada"
          description="Nenhuma vaga pendente de moderação agora."
        />
      )}

      <div className="stack">
        {jobPostings?.map((jobPosting) =>
          token ? (
            <ModerationQueueItem
              key={jobPosting.id}
              jobPosting={jobPosting}
              token={token}
              onDecided={load}
            />
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
