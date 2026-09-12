import { Inject, Injectable } from "@nestjs/common";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { ContactInfo } from "../../domain/contact-info.vo";
import { JobPosting } from "../../domain/job-posting.entity";
import { SalaryRange } from "../../domain/salary-range.vo";
import { JOB_POSTING_REPOSITORY } from "../../job-posting.tokens";
import { JobPostingRepository } from "../ports/job-posting-repository.port";

export interface JobPostingInput {
  title: string;
  description: string;
  requirements: string;
  salaryMinCents: number;
  salaryMaxCents: number;
  location: string;
  contactEmail?: string;
  contactPhone?: string;
  contactApplicationUrl?: string;
  unlockCost: number;
}

export interface CreateJobPostingInput extends JobPostingInput {
  companyId: string;
}

export interface CreateJobPostingOutput {
  jobPostingId: string;
}

@Injectable()
export class CreateJobPostingUseCase {
  constructor(@Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository) {}

  async execute(input: CreateJobPostingInput): Promise<CreateJobPostingOutput> {
    const jobPosting = JobPosting.create({
      companyId: input.companyId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      salaryRange: SalaryRange.create(input.salaryMinCents, input.salaryMaxCents),
      location: input.location,
      contactInfo: ContactInfo.create({
        email: input.contactEmail,
        phone: input.contactPhone,
        applicationUrl: input.contactApplicationUrl,
      }),
      unlockCost: CreditAmount.of(input.unlockCost),
    });

    await this.jobPostingRepository.save(jobPosting);

    return { jobPostingId: jobPosting.id };
  }
}
