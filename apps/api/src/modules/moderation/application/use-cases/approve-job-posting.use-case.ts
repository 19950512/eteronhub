import { Inject, Injectable } from "@nestjs/common";
import { JobPostingNotFoundError } from "../../../job-posting/application/errors";
import { JobPostingRepository } from "../../../job-posting/application/ports/job-posting-repository.port";
import { JOB_POSTING_REPOSITORY } from "../../../job-posting/job-posting.tokens";
import { ModerationDecision } from "../../domain/moderation-decision.entity";
import { MODERATION_DECISION_REPOSITORY } from "../../moderation.tokens";
import { ModerationDecisionRepository } from "../ports/moderation-decision-repository.port";

const PUBLISHED_VALIDITY_DAYS = 30;

@Injectable()
export class ApproveJobPostingUseCase {
  constructor(
    @Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository,
    @Inject(MODERATION_DECISION_REPOSITORY) private readonly moderationDecisionRepository: ModerationDecisionRepository,
  ) {}

  async execute(jobPostingId: string, adminId: string): Promise<void> {
    const jobPosting = await this.jobPostingRepository.findById(jobPostingId);
    if (!jobPosting) {
      throw new JobPostingNotFoundError(`Vaga não encontrada: ${jobPostingId}`);
    }

    const publishedAt = new Date();
    const expiresAt = new Date(publishedAt.getTime() + PUBLISHED_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
    jobPosting.approve(publishedAt, expiresAt);

    // Fase 2 ainda não tem um UnitOfWork transacional entre repositórios
    // (ver apps/api/src/infra/prisma/prisma-unit-of-work.ts) — as duas
    // escritas abaixo não são atômicas.
    await this.jobPostingRepository.save(jobPosting);
    await this.moderationDecisionRepository.save(ModerationDecision.approve({ jobPostingId, adminId }));
  }
}
