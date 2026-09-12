import { Module } from "@nestjs/common";
import { CompanyModule } from "../company/company.module";
import { JobPostingModule } from "../job-posting/job-posting.module";
import { GetJobPostingDetailsForWorkerUseCase } from "./application/use-cases/get-job-posting-details-for-worker.use-case";
import { ListWorkerJobUnlocksUseCase } from "./application/use-cases/list-worker-job-unlocks.use-case";
import { UnlockJobPostingUseCase } from "./application/use-cases/unlock-job-posting.use-case";
import { PrismaJobUnlockRepository } from "./infra/persistence/prisma-job-unlock.repository";
import { PrismaJobUnlockWriter } from "./infra/persistence/prisma-job-unlock.writer";
import { JobUnlockController } from "./job-unlock.controller";
import { JOB_UNLOCK_REPOSITORY, JOB_UNLOCK_WRITER } from "./job-unlock.tokens";

@Module({
  imports: [JobPostingModule, CompanyModule],
  controllers: [JobUnlockController],
  providers: [
    { provide: JOB_UNLOCK_REPOSITORY, useClass: PrismaJobUnlockRepository },
    { provide: JOB_UNLOCK_WRITER, useClass: PrismaJobUnlockWriter },
    UnlockJobPostingUseCase,
    ListWorkerJobUnlocksUseCase,
    GetJobPostingDetailsForWorkerUseCase,
  ],
  exports: [GetJobPostingDetailsForWorkerUseCase],
})
export class JobUnlockModule {}
