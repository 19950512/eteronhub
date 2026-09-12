import { Inject, Injectable } from "@nestjs/common";
import { JobPostingRepository } from "../../../job-posting/application/ports/job-posting-repository.port";
import { JOB_POSTING_REPOSITORY } from "../../../job-posting/job-posting.tokens";
import { JOB_UNLOCK_REPOSITORY } from "../../job-unlock.tokens";
import { JobUnlockRepository } from "../ports/job-unlock-repository.port";

export interface JobUnlockHistoryItem {
  jobPostingId: string;
  jobPostingTitle: string | null;
  creditsSpent: number;
  unlockedAt: Date;
}

@Injectable()
export class ListWorkerJobUnlocksUseCase {
  constructor(
    @Inject(JOB_UNLOCK_REPOSITORY) private readonly jobUnlockRepository: JobUnlockRepository,
    @Inject(JOB_POSTING_REPOSITORY) private readonly jobPostingRepository: JobPostingRepository,
  ) {}

  async execute(workerId: string): Promise<JobUnlockHistoryItem[]> {
    const unlocks = await this.jobUnlockRepository.findByWorker(workerId);

    const items: JobUnlockHistoryItem[] = [];
    for (const unlock of unlocks) {
      const jobPosting = await this.jobPostingRepository.findById(unlock.jobPostingId);
      items.push({
        jobPostingId: unlock.jobPostingId,
        jobPostingTitle: jobPosting ? jobPosting.toPublicView().title : null,
        creditsSpent: unlock.creditsSpent.value,
        unlockedAt: unlock.unlockedAt,
      });
    }
    return items;
  }
}
