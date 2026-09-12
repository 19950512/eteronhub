"use client";

import { useRouter } from "next/navigation";
import { JobPostingForm } from "../../../../components/job-posting-form";
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
    <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1>Nova vaga</h1>
      <JobPostingForm submitLabel="Criar rascunho" onSubmit={handleSubmit} />
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
