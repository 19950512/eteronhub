import { ArrowRight, HardHat, LockKeyhole, MapPin } from "lucide-react";
import Link from "next/link";
import type { JobPostingPublicView } from "../../lib/api/job-postings";
import { formatSalaryRange } from "../../lib/format";

export function JobCard({
  jobPosting,
}: {
  jobPosting: JobPostingPublicView;
}): JSX.Element {
  return (
    <Link href={`/vagas/${jobPosting.id}`} className="card card-interactive job-card">
      <div className="job-card-head">
        <span className="icon-tile">
          <HardHat aria-hidden="true" />
        </span>
        <div className="stack-sm" style={{ gap: 4, minWidth: 0 }}>
          <h3 className="job-card-title">{jobPosting.title}</h3>
          <div className="meta-row">
            <span>
              <MapPin aria-hidden="true" />
              {jobPosting.location}
            </span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted">Faixa salarial</p>
        <p className="job-card-salary">
          {formatSalaryRange(jobPosting.salaryRangeCents)}
        </p>
      </div>

      <div className="job-card-foot">
        <span className="chip">
          <LockKeyhole aria-hidden="true" />
          Empresa oculta · {jobPosting.unlockCost} créditos
        </span>
        <span className="job-card-cta">
          Ver vaga
          <ArrowRight aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function JobCardSkeleton(): JSX.Element {
  return (
    <div className="card job-card" aria-hidden="true">
      <div className="job-card-head">
        <span className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
        <div className="stack-sm" style={{ flex: 1 }}>
          <span className="skeleton" style={{ height: 20, width: "80%" }} />
          <span className="skeleton" style={{ height: 14, width: "45%" }} />
        </div>
      </div>
      <span className="skeleton" style={{ height: 26, width: "60%" }} />
      <div className="job-card-foot">
        <span
          className="skeleton"
          style={{ height: 24, width: 150, borderRadius: 999 }}
        />
      </div>
    </div>
  );
}
