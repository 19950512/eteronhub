import { Module } from "@nestjs/common";
import { CloseJobPostingUseCase } from "./application/use-cases/close-job-posting.use-case";
import { CreateJobPostingUseCase } from "./application/use-cases/create-job-posting.use-case";
import { ExpireJobPostingsUseCase } from "./application/use-cases/expire-job-postings.use-case";
import { GetPublicJobPostingDetailsUseCase } from "./application/use-cases/get-public-job-posting-details.use-case";
import { ListCompanyJobPostingsUseCase } from "./application/use-cases/list-company-job-postings.use-case";
import { ListPublicJobPostingsUseCase } from "./application/use-cases/list-public-job-postings.use-case";
import { SubmitJobPostingForModerationUseCase } from "./application/use-cases/submit-job-posting-for-moderation.use-case";
import { UpdateJobPostingDraftUseCase } from "./application/use-cases/update-job-posting-draft.use-case";
import { ExpireJobPostingsJob } from "./infra/jobs/expire-job-postings.job";
import { PrismaJobPostingRepository } from "./infra/persistence/prisma-job-posting.repository";
import { JobPostingCompanyController } from "./job-posting-company.controller";
import { JobPostingPublicController } from "./job-posting-public.controller";
import { JOB_POSTING_REPOSITORY } from "./job-posting.tokens";

@Module({
  controllers: [JobPostingCompanyController, JobPostingPublicController],
  providers: [
    { provide: JOB_POSTING_REPOSITORY, useClass: PrismaJobPostingRepository },
    CreateJobPostingUseCase,
    UpdateJobPostingDraftUseCase,
    SubmitJobPostingForModerationUseCase,
    CloseJobPostingUseCase,
    ListCompanyJobPostingsUseCase,
    ListPublicJobPostingsUseCase,
    GetPublicJobPostingDetailsUseCase,
    ExpireJobPostingsUseCase,
    ExpireJobPostingsJob,
  ],
  exports: [JOB_POSTING_REPOSITORY],
})
export class JobPostingModule {}
