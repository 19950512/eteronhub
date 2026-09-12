import { Inject, Injectable } from "@nestjs/common";
import { JOB_POSTING_REPOSITORY } from "../../job-posting.tokens";
import { JobPostingRepository } from "../ports/job-posting-repository.port";

@Injectable()
export class ExpireJobPostingsUseCase {
  constructor(@Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository) {}

  async execute(now: Date = new Date()): Promise<void> {
    const expired = await this.jobPostingRepository.findExpiredPublished(now);
    for (const jobPosting of expired) {
      jobPosting.expire(now);
      await this.jobPostingRepository.save(jobPosting);
    }
  }
}
