import { Inject, Injectable } from "@nestjs/common";
import { JobPostingNotFoundError } from "../../../job-posting/application/errors";
import { JobPostingRepository } from "../../../job-posting/application/ports/job-posting-repository.port";
import { JOB_POSTING_REPOSITORY } from "../../../job-posting/job-posting.tokens";
import { JobUnlock } from "../../domain/job-unlock.entity";
import { JOB_UNLOCK_REPOSITORY, JOB_UNLOCK_WRITER } from "../../job-unlock.tokens";
import { JobPostingNotAvailableForUnlockError } from "../errors";
import { JobUnlockRepository } from "../ports/job-unlock-repository.port";
import { JobUnlockWriter } from "../ports/job-unlock-writer.port";

export interface UnlockJobPostingOutput {
  jobPostingId: string;
  creditsSpent: number;
  unlockedAt: Date;
  alreadyUnlocked: boolean;
}

@Injectable()
export class UnlockJobPostingUseCase {
  constructor(
    @Inject(JOB_UNLOCK_REPOSITORY) private readonly jobUnlockRepository: JobUnlockRepository,
    @Inject(JOB_UNLOCK_WRITER) private readonly jobUnlockWriter: JobUnlockWriter,
    @Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository,
  ) {}

  async execute(workerId: string, jobPostingId: string): Promise<UnlockJobPostingOutput> {
    // Checagem rápida fora do escritor atômico: além de evitar o custo de
    // carregar a vaga, é o que permite reabrir uma vaga já desbloqueada
    // mesmo depois de encerrada/expirada (regras 21-22) — se checássemos o
    // status da vaga primeiro, um desbloqueio antigo ficaria bloqueado.
    const existing = await this.jobUnlockRepository.findByWorkerAndJobPosting(workerId, jobPostingId);
    if (existing) {
      return this.toOutput(existing, true);
    }

    const jobPosting = await this.jobPostingRepository.findById(jobPostingId);
    if (!jobPosting) {
      throw new JobPostingNotFoundError(`Vaga não encontrada: ${jobPostingId}`);
    }
    if (jobPosting.status !== "PUBLISHED") {
      throw new JobPostingNotAvailableForUnlockError("Esta vaga não está disponível para desbloqueio");
    }

    const result = await this.jobUnlockWriter.unlock({
      workerId,
      jobPostingId,
      unlockCost: jobPosting.unlockCost,
    });

    return this.toOutput(result.jobUnlock, result.alreadyExisted);
  }

  private toOutput(jobUnlock: JobUnlock, alreadyUnlocked: boolean): UnlockJobPostingOutput {
    return {
      jobPostingId: jobUnlock.jobPostingId,
      creditsSpent: jobUnlock.creditsSpent.value,
      unlockedAt: jobUnlock.unlockedAt,
      alreadyUnlocked,
    };
  }
}
