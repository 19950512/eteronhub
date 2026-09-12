import { Inject, Injectable } from "@nestjs/common";
import { JobPostingInternalView } from "../../domain/job-posting.entity";
import { JOB_POSTING_REPOSITORY } from "../../job-posting.tokens";
import { JobPostingRepository } from "../ports/job-posting-repository.port";

@Injectable()
export class ListCompanyJobPostingsUseCase {
  constructor(@Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository) {}

  async execute(companyId: string): Promise<JobPostingInternalView[]> {
    const jobPostings = await this.jobPostingRepository.findByCompany(companyId);
    return jobPostings.map((jobPosting) => jobPosting.toInternalView());
  }
}
