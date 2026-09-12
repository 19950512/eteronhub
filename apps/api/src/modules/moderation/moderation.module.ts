import { Module } from "@nestjs/common";
import { JobPostingModule } from "../job-posting/job-posting.module";
import { ApproveJobPostingUseCase } from "./application/use-cases/approve-job-posting.use-case";
import { ListPendingModerationUseCase } from "./application/use-cases/list-pending-moderation.use-case";
import { RejectJobPostingUseCase } from "./application/use-cases/reject-job-posting.use-case";
import { PrismaModerationDecisionRepository } from "./infra/persistence/prisma-moderation-decision.repository";
import { ModerationController } from "./moderation.controller";
import { MODERATION_DECISION_REPOSITORY } from "./moderation.tokens";

@Module({
  imports: [JobPostingModule],
  controllers: [ModerationController],
  providers: [
    { provide: MODERATION_DECISION_REPOSITORY, useClass: PrismaModerationDecisionRepository },
    ListPendingModerationUseCase,
    ApproveJobPostingUseCase,
    RejectJobPostingUseCase,
  ],
})
export class ModerationModule {}
