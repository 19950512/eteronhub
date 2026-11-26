import type { Metadata } from "next";
import { Suspense } from "react";
import { JobBoard } from "../../components/jobs/job-board";
import { JobCardSkeleton } from "../../components/jobs/job-card";
import { PageHeader } from "../../components/ui/page-header";

export const metadata: Metadata = {
  title: "Vagas",
  description:
    "Vagas abertas para soldadores, caldeireiros, montadores, serralheiros e outros profissionais da metalurgia.",
};

export default function JobsPage(): JSX.Element {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="Vagas abertas"
        title="Encontre sua próxima obra"
        description="Todas as vagas são revisadas pela nossa equipe. A empresa fica oculta até você desbloquear com créditos."
      />
      <Suspense
        fallback={
          <div className="grid-3">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        }
      >
        <JobBoard />
      </Suspense>
    </div>
  );
}
