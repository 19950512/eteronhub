import { Inject, Injectable } from "@nestjs/common";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { ContactInfo } from "../../domain/contact-info.vo";
import { SalaryRange } from "../../domain/salary-range.vo";
import { JOB_POSTING_REPOSITORY } from "../../job-posting.tokens";
import { loadOwnedJobPosting } from "../load-owned-job-posting";
import { JobPostingRepository } from "../ports/job-posting-repository.port";
import { JobPostingInput } from "./create-job-posting.use-case";

@Injectable()
export class UpdateJobPostingDraftUseCase {
  constructor(@Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository) {}

  async execute(companyId: string, jobPostingId: string, input: JobPostingInput): Promise<void> {
    const jobPosting = await loadOwnedJobPosting(this.jobPostingRepository, companyId, jobPostingId);

    jobPosting.updateDraft({
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
  }
}
