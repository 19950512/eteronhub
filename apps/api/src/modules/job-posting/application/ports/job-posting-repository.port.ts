import { JobPosting } from "../../domain/job-posting.entity";

export interface JobPostingFilter {
  location?: string;
}

export interface JobPostingRepository {
  save(jobPosting: JobPosting): Promise<void>;
  findById(id: string): Promise<JobPosting | null>;
  findByCompany(companyId: string): Promise<JobPosting[]>;
  findPublished(filter?: JobPostingFilter): Promise<JobPosting[]>;
  findPendingModeration(): Promise<JobPosting[]>;
  findExpiredPublished(now: Date): Promise<JobPosting[]>;
}
