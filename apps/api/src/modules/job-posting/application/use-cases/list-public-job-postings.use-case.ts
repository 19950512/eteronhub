import { Inject, Injectable } from "@nestjs/common";
import { JobPostingPublicView } from "../../domain/job-posting.entity";
import { JOB_POSTING_REPOSITORY } from "../../job-posting.tokens";
import { JobPostingFilter, JobPostingRepository } from "../ports/job-posting-repository.port";

@Injectable()
export class ListPublicJobPostingsUseCase {
  constructor(@Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository) {}

  async execute(filter?: JobPostingFilter): Promise<JobPostingPublicView[]> {
    const jobPostings = await this.jobPostingRepository.findPublished(filter);
    return jobPostings.map((jobPosting) => jobPosting.toPublicView());
  }
}
