import { Inject, Injectable } from "@nestjs/common";
import { JOB_POSTING_REPOSITORY } from "../../job-posting.tokens";
import { loadOwnedJobPosting } from "../load-owned-job-posting";
import { JobPostingRepository } from "../ports/job-posting-repository.port";

@Injectable()
export class SubmitJobPostingForModerationUseCase {
  constructor(@Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository) {}

  async execute(companyId: string, jobPostingId: string): Promise<void> {
    const jobPosting = await loadOwnedJobPosting(this.jobPostingRepository, companyId, jobPostingId);
    jobPosting.submitForModeration();
    await this.jobPostingRepository.save(jobPosting);
  }
}
