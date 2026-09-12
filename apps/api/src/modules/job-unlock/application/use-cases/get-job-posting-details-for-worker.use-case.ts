import { Inject, Injectable } from "@nestjs/common";
import { CompanyRepository } from "../../../company/application/ports/company-repository.port";
import { COMPANY_REPOSITORY } from "../../../company/company.tokens";
import { JobPostingNotFoundError } from "../../../job-posting/application/errors";
import { JobPostingRepository } from "../../../job-posting/application/ports/job-posting-repository.port";
import { JobPostingPublicView, JobPostingUnlockedView } from "../../../job-posting/domain/job-posting.entity";
import { JOB_POSTING_REPOSITORY } from "../../../job-posting/job-posting.tokens";
import { JOB_UNLOCK_REPOSITORY } from "../../job-unlock.tokens";
import { JobUnlockRepository } from "../ports/job-unlock-repository.port";

@Injectable()
export class GetJobPostingDetailsForWorkerUseCase {
  constructor(
    @Inject(JOB_UNLOCK_REPOSITORY) private readonly jobUnlockRepository: JobUnlockRepository,
    @Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository,
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(workerId: string, jobPostingId: string): Promise<JobPostingPublicView | JobPostingUnlockedView> {
    const jobPosting = await this.jobPostingRepository.findById(jobPostingId);
    if (!jobPosting) {
      throw new JobPostingNotFoundError(`Vaga não encontrada: ${jobPostingId}`);
    }

    const unlock = await this.jobUnlockRepository.findByWorkerAndJobPosting(workerId, jobPostingId);
    if (unlock) {
      const company = await this.companyRepository.findById(jobPosting.companyId);
      return jobPosting.toUnlockedView({
        razaoSocial: company?.razaoSocial ?? "",
        nomeFantasia: company?.nomeFantasia ?? null,
      });
    }

    // Sem desbloqueio: mesma regra do detalhe público — uma vaga fora do
    // catálogo (não PUBLISHED) não existe para quem não a desbloqueou.
    if (jobPosting.status !== "PUBLISHED") {
      throw new JobPostingNotFoundError(`Vaga não encontrada: ${jobPostingId}`);
    }

    return jobPosting.toPublicView();
  }
}
