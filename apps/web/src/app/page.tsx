"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiRequestError } from "../lib/api/client";
import { JobPostingPublicView, listPublicJobPostings } from "../lib/api/job-postings";
import { formatBRL } from "../lib/format";

export default function HomePage(): JSX.Element {
  const [location, setLocation] = useState("");
  const [jobPostings, setJobPostings] = useState<JobPostingPublicView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    listPublicJobPostings(location || undefined)
      .then((result) => {
        if (!cancelled) setJobPostings(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiRequestError ? err.message : "Não foi possível carregar as vagas");
      });
    return () => {
      cancelled = true;
    };
  }, [location]);

  return (
    <div className="stack">
      <div>
        <h1>Vagas disponíveis</h1>
        <p className="text-muted">
          As vagas são publicadas de forma anônima. Desbloqueie com créditos para ver a empresa e o contato.
        </p>
      </div>

      <div className="form-field" style={{ maxWidth: 320 }}>
        <label htmlFor="location">Filtrar por localização</label>
        <input
          id="location"
          placeholder="Ex.: São Paulo, Remoto..."
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      {jobPostings === null && !error && <p className="text-muted">Carregando...</p>}

      {jobPostings && jobPostings.length === 0 && <p className="text-muted">Nenhuma vaga encontrada.</p>}

      <div className="job-list">
        {jobPostings?.map((jobPosting) => (
          <Link key={jobPosting.id} href={`/vagas/${jobPosting.id}`} className="card">
            <h3 className="card-title">{jobPosting.title}</h3>
            <p className="text-muted">{jobPosting.location}</p>
            <p className="text-muted">
              {formatBRL(jobPosting.salaryRangeCents.min)} - {formatBRL(jobPosting.salaryRangeCents.max)} · custo de
              desbloqueio: {jobPosting.unlockCost} créditos
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
