import { Inject, Injectable } from "@nestjs/common";
import { JobPostingPublicView } from "../../domain/job-posting.entity";
import { JOB_POSTING_REPOSITORY } from "../../job-posting.tokens";
import { JobPostingNotFoundError } from "../errors";
import { JobPostingRepository } from "../ports/job-posting-repository.port";

@Injectable()
export class GetPublicJobPostingDetailsUseCase {
  constructor(@Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository) {}

  // A partir da Fase 4 (job-unlock), este caso de uso passa a decidir entre a
  // visão pública e a visão completa consultando se o trabalhador já
  // desbloqueou a vaga. Até lá, toda vaga publicada é vista anonimizada.
  async execute(jobPostingId: string): Promise<JobPostingPublicView> {
    const jobPosting = await this.jobPostingRepository.findById(jobPostingId);
    if (!jobPosting || jobPosting.status !== "PUBLISHED") {
      throw new JobPostingNotFoundError(`Vaga não encontrada: ${jobPostingId}`);
    }
    return jobPosting.toPublicView();
  }
}
