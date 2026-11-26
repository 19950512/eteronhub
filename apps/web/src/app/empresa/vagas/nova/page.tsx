"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JobPostingForm } from "../../../../components/job-posting-form";
import { PageHeader } from "../../../../components/ui/page-header";
import { createJobPosting, JobPostingFormInput } from "../../../../lib/api/job-postings";
import { useAuth } from "../../../../lib/auth/auth-context";
import { RequireRole } from "../../../../lib/auth/require-role";

function NewJobPosting(): JSX.Element {
  const { token } = useAuth();
  const router = useRouter();

  async function handleSubmit(input: JobPostingFormInput): Promise<void> {
    if (!token) return;
    await createJobPosting(token, input);
    router.push("/empresa");
  }

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
      <PageHeader
        eyebrow="Nova vaga"
        title="Crie um rascunho"
        description="Depois de salvar, revise e envie para moderação. A vaga é publicada sem o nome da empresa."
      />
      <div className="card">
        <JobPostingForm submitLabel="Salvar rascunho" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default function NewJobPostingPage(): JSX.Element {
  return (
    <RequireRole role="COMPANY" redirectTo="/login">
      <NewJobPosting />
    </RequireRole>
  );
}
