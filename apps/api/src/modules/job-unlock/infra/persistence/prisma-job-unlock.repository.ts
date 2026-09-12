import { Injectable } from "@nestjs/common";
import type { JobUnlock as JobUnlockRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { JobUnlockRepository } from "../../application/ports/job-unlock-repository.port";
import { JobUnlock } from "../../domain/job-unlock.entity";

@Injectable()
export class PrismaJobUnlockRepository implements JobUnlockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByWorkerAndJobPosting(workerId: string, jobPostingId: string): Promise<JobUnlock | null> {
    const record = await this.prisma.jobUnlock.findUnique({
      where: { workerId_jobPostingId: { workerId, jobPostingId } },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByWorker(workerId: string): Promise<JobUnlock[]> {
    const records = await this.prisma.jobUnlock.findMany({
      where: { workerId },
      orderBy: { unlockedAt: "desc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: JobUnlockRecord): JobUnlock {
    return JobUnlock.restore({
      id: record.id,
      workerId: record.workerId,
      jobPostingId: record.jobPostingId,
      creditsSpent: CreditAmount.of(record.creditsSpent),
      unlockedAt: record.unlockedAt,
    });
  }
}
