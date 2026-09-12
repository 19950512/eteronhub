import { Inject, Injectable, Logger } from "@nestjs/common";
import { JobPostingNotFoundError } from "../../../job-posting/application/errors";
import { JobPostingRepository } from "../../../job-posting/application/ports/job-posting-repository.port";
import { JOB_POSTING_REPOSITORY } from "../../../job-posting/job-posting.tokens";
import { ModerationDecision } from "../../domain/moderation-decision.entity";
import { MODERATION_DECISION_REPOSITORY } from "../../moderation.tokens";
import { ModerationDecisionRepository } from "../ports/moderation-decision-repository.port";

@Injectable()
export class RejectJobPostingUseCase {
  private readonly logger = new Logger(RejectJobPostingUseCase.name);

  constructor(
    @Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository,
    @Inject(MODERATION_DECISION_REPOSITORY) private readonly moderationDecisionRepository: ModerationDecisionRepository,
  ) {}

  async execute(jobPostingId: string, adminId: string, reason: string): Promise<void> {
    const jobPosting = await this.jobPostingRepository.findById(jobPostingId);
    if (!jobPosting) {
      throw new JobPostingNotFoundError(`Vaga não encontrada: ${jobPostingId}`);
    }

    jobPosting.reject(reason);

    await this.jobPostingRepository.save(jobPosting);
    await this.moderationDecisionRepository.save(ModerationDecision.reject({ jobPostingId, adminId, reason }));

    this.logger.log(`Vaga ${jobPostingId} rejeitada pelo admin ${adminId}: ${reason}`);
  }
}
