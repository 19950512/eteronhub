import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import type { JobPostingPublicView } from "../../lib/api/job-postings";
import { formatSalaryRange } from "../../lib/format";

// invariant: renderizado dentro de um item de `.job-list` (ul/li ou div) — o
// espaçamento e as linhas divisórias vêm da lista, não do item.
export function JobCard({
  jobPosting,
}: {
  jobPosting: JobPostingPublicView;
}): JSX.Element {
  return (
    <Link href={`/vagas/${jobPosting.id}`} className="job-row">
      <div className="job-row-main">
        <h3 className="job-row-title">{jobPosting.title}</h3>
        <p className="job-row-place">
          <MapPin aria-hidden="true" />
          {jobPosting.location}
        </p>
      </div>
      <p className="job-row-salary">{formatSalaryRange(jobPosting.salaryRangeCents)}</p>
      <p className="job-row-cost">
        Empresa oculta · {jobPosting.unlockCost}{" "}
        {jobPosting.unlockCost === 1 ? "crédito" : "créditos"}
        <ArrowRight aria-hidden="true" />
      </p>
    </Link>
  );
}

export function JobCardSkeleton(): JSX.Element {
  return (
    <div className="job-row" aria-hidden="true">
      <div className="job-row-main">
        <span className="skeleton" style={{ height: 22, width: "70%" }} />
        <span className="skeleton" style={{ height: 14, width: "35%" }} />
      </div>
      <span className="skeleton" style={{ height: 20, width: 140 }} />
      <span className="skeleton" style={{ height: 14, width: 120 }} />
    </div>
  );
}
