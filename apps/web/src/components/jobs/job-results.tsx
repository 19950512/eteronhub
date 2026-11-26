"use client";

import { SearchX } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ApiRequestError } from "../../lib/api/client";
import { JobPostingPublicView, listPublicJobPostings } from "../../lib/api/job-postings";
import { Alert } from "../ui/alert";
import { EmptyState } from "../ui/empty-state";
import { JobCard, JobCardSkeleton } from "./job-card";

interface JobResultsProps {
  location?: string;
  limit?: number;
  emptyAction?: ReactNode;
  onLoaded?: (count: number) => void;
}

export function JobResults({
  location,
  limit,
  emptyAction,
  onLoaded,
}: JobResultsProps): JSX.Element {
  const [jobPostings, setJobPostings] = useState<JobPostingPublicView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setJobPostings(null);
    // why: debounce evita uma requisição por tecla digitada no filtro.
    const timer = setTimeout(() => {
      listPublicJobPostings(location || undefined)
        .then((result) => {
          if (cancelled) return;
          setJobPostings(result);
          onLoaded?.(result.length);
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(
              err instanceof ApiRequestError
                ? err.message
                : "Não foi possível carregar as vagas",
            );
          }
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [location, onLoaded]);

  if (error) {
    return (
      <Alert tone="error" title="Não deu para carregar as vagas">
        {error}
      </Alert>
    );
  }

  if (jobPostings === null) {
    return (
      <div className="grid-3" role="status" aria-label="Carregando vagas">
        {Array.from({ length: limit ? Math.min(limit, 3) : 6 }, (_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (jobPostings.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="Nenhuma vaga encontrada"
        description={
          location
            ? `Não há vagas abertas em “${location}” agora. Tente outra cidade ou região.`
            : "Ainda não há vagas publicadas. Volte em breve para conferir novas oportunidades."
        }
        action={emptyAction}
      />
    );
  }

  const visible = limit ? jobPostings.slice(0, limit) : jobPostings;

  return (
    <div className="grid-3">
      {visible.map((jobPosting) => (
        <JobCard key={jobPosting.id} jobPosting={jobPosting} />
      ))}
    </div>
  );
}
