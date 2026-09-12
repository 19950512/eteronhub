"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiRequestError } from "../../../lib/api/client";
import {
  getJobPostingDetails,
  JobPostingPublicView,
  JobPostingUnlockedView,
} from "../../../lib/api/job-postings";
import { unlockJobPosting } from "../../../lib/api/job-unlock";
import { useAuth } from "../../../lib/auth/auth-context";
import { formatBRL } from "../../../lib/format";

function isUnlocked(view: JobPostingPublicView | JobPostingUnlockedView): view is JobPostingUnlockedView {
  return "companyName" in view;
}

export default function JobPostingDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { token, payload, isLoading: authLoading } = useAuth();
  const [jobPosting, setJobPosting] = useState<JobPostingPublicView | JobPostingUnlockedView | null>(null);
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
        if (!cancelled) setError(err instanceof ApiRequestError ? err.message : "Vaga não encontrada");
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
      setUnlockError(err instanceof ApiRequestError ? err.message : "Não foi possível desbloquear a vaga");
    } finally {
      setUnlocking(false);
    }
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!jobPosting) {
    return <p className="text-muted">Carregando...</p>;
  }

  const unlocked = isUnlocked(jobPosting);

  return (
    <div className="stack">
      <div className="card">
        <h1>{jobPosting.title}</h1>
        {unlocked && <p className="text-muted">{jobPosting.companyName}</p>}
        <p className="text-muted">{jobPosting.location}</p>
        <p>
          {formatBRL(jobPosting.salaryRangeCents.min)} - {formatBRL(jobPosting.salaryRangeCents.max)}
        </p>

        <h3 className="card-title">Descrição</h3>
        <p>{jobPosting.description}</p>

        <h3 className="card-title">Requisitos</h3>
        <p>{jobPosting.requirements}</p>

        {unlocked && (
          <>
            <h3 className="card-title">Contato</h3>
            <ul>
              {jobPosting.contactInfo.email && <li>E-mail: {jobPosting.contactInfo.email}</li>}
              {jobPosting.contactInfo.phone && <li>Telefone: {jobPosting.contactInfo.phone}</li>}
              {jobPosting.contactInfo.applicationUrl && (
                <li>
                  Link para aplicação:{" "}
                  <a href={jobPosting.contactInfo.applicationUrl} target="_blank" rel="noreferrer">
                    {jobPosting.contactInfo.applicationUrl}
                  </a>
                </li>
              )}
            </ul>
          </>
        )}
      </div>

      {!unlocked && (
        <div className="card">
          <h3 className="card-title">Desbloquear vaga</h3>
          <p className="text-muted">
            Veja o nome da empresa e o contato desbloqueando esta vaga por {jobPosting.unlockCost} créditos.
          </p>
          {payload?.role === "WORKER" ? (
            <>
              {unlockError && <p className="error-message">{unlockError}</p>}
              <button className="button" onClick={handleUnlock} disabled={unlocking}>
                {unlocking ? "Desbloqueando..." : `Desbloquear por ${jobPosting.unlockCost} créditos`}
              </button>
            </>
          ) : (
            <p className="text-muted">
              <Link href="/login">Entre como trabalhador</Link> para desbloquear esta vaga.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
