"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JobPostingForm } from "../../../../../components/job-posting-form";
import { Alert } from "../../../../../components/ui/alert";
import { PageHeader } from "../../../../../components/ui/page-header";
import { PageLoading } from "../../../../../components/ui/spinner";
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
      .catch((err: unknown) =>
        setError(
          err instanceof ApiRequestError ? err.message : "Erro ao carregar a vaga",
        ),
      );
  }, [id, token]);

  async function handleSubmit(input: JobPostingFormInput): Promise<void> {
    if (!token) return;
    await updateJobPostingDraft(token, id, input);
    router.push("/empresa");
  }

  if (error) {
    return (
      <div className="container container-narrow page">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  }
  if (!jobPosting) return <PageLoading label="Carregando vaga..." />;

  return (
    <div className="container container-narrow page">
      <Link
        href="/empresa"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: "var(--space-4)", marginLeft: -12 }}
      >
        <ArrowLeft aria-hidden="true" />
        Minhas vagas
      </Link>
      <PageHeader eyebrow="Editar vaga" title={jobPosting.title} />
      {jobPosting.status === "REJECTED" && jobPosting.rejectionReason && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          <Alert tone="error" title="Ajuste o que a moderação pediu">
            {jobPosting.rejectionReason}
          </Alert>
        </div>
      )}
      <div className="card">
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
