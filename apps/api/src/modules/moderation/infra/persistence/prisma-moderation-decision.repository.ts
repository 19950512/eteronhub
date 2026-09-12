import { Injectable } from "@nestjs/common";
import type { ModerationDecision as ModerationDecisionRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { ModerationDecisionRepository } from "../../application/ports/moderation-decision-repository.port";
import { ModerationDecision, ModerationDecisionType } from "../../domain/moderation-decision.entity";

@Injectable()
export class PrismaModerationDecisionRepository implements ModerationDecisionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(decision: ModerationDecision): Promise<void> {
    await this.prisma.moderationDecision.create({
      data: {
        id: decision.id,
        jobPostingId: decision.jobPostingId,
        adminId: decision.adminId,
        decision: decision.decision,
        reason: decision.reason,
        decidedAt: decision.decidedAt,
      },
    });
  }

  async findByJobPosting(jobPostingId: string): Promise<ModerationDecision[]> {
    const records = await this.prisma.moderationDecision.findMany({
      where: { jobPostingId },
      orderBy: { decidedAt: "asc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: ModerationDecisionRecord): ModerationDecision {
    return ModerationDecision.restore({
      id: record.id,
      jobPostingId: record.jobPostingId,
      adminId: record.adminId,
      decision: record.decision as ModerationDecisionType,
      reason: record.reason,
      decidedAt: record.decidedAt,
    });
  }
}
