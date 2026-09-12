"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JobPostingForm } from "../../../../../components/job-posting-form";
import { ApiRequestError } from "../../../../../lib/api/client";
import {
  JobPostingFormInput,
  JobPostingInternalView,
  listCompanyJobPostings,
  updateJobPostingDraft,
} from "../../../../../lib/api/job-postings";
import { useAuth } from "../../../../../lib/auth/auth-context";
import { RequireRole } from "../../../../../lib/auth/require-role";

function EditJobPosting(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const [jobPosting, setJobPosting] = useState<JobPostingInternalView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listCompanyJobPostings(token)
      .then((jobPostings) => {
        const found = jobPostings.find((j) => j.id === id);
        if (!found) {
          setError("Vaga não encontrada");
          return;
        }
        setJobPosting(found);
      })
      .catch((err: unknown) => setError(err instanceof ApiRequestError ? err.message : "Erro ao carregar a vaga"));
  }, [id, token]);

  async function handleSubmit(input: JobPostingFormInput): Promise<void> {
    if (!token) return;
    await updateJobPostingDraft(token, id, input);
    router.push("/empresa");
  }

  if (error) return <p className="error-message">{error}</p>;
  if (!jobPosting) return <p className="text-muted">Carregando...</p>;

  return (
    <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1>Editar vaga</h1>
      <JobPostingForm
        submitLabel="Salvar rascunho"
        onSubmit={handleSubmit}
        initialValues={{
          title: jobPosting.title,
          description: jobPosting.description,
          requirements: jobPosting.requirements,
          location: jobPosting.location,
          salaryMinCents: jobPosting.salaryRangeCents.min,
          salaryMaxCents: jobPosting.salaryRangeCents.max,
          unlockCost: jobPosting.unlockCost,
          contactEmail: jobPosting.contactInfo.email ?? undefined,
          contactPhone: jobPosting.contactInfo.phone ?? undefined,
          contactApplicationUrl: jobPosting.contactInfo.applicationUrl ?? undefined,
        }}
      />
    </div>
  );
}

export default function EditJobPostingPage(): JSX.Element {
  return (
    <RequireRole role="COMPANY" redirectTo="/login">
      <EditJobPosting />
    </RequireRole>
  );
}
