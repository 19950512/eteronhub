import { Inject, Injectable } from "@nestjs/common";
import { JobPostingInternalView } from "../../../job-posting/domain/job-posting.entity";
import { JOB_POSTING_REPOSITORY } from "../../../job-posting/job-posting.tokens";
import { JobPostingRepository } from "../../../job-posting/application/ports/job-posting-repository.port";

@Injectable()
export class ListPendingModerationUseCase {
  constructor(@Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository) {}

  async execute(): Promise<JobPostingInternalView[]> {
    const jobPostings = await this.jobPostingRepository.findPendingModeration();
    return jobPostings.map((jobPosting) => jobPosting.toInternalView());
  }
}
