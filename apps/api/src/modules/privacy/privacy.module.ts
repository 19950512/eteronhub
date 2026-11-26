import { Module } from "@nestjs/common";
import { CompanyModule } from "../company/company.module";
import { JobPostingModule } from "../job-posting/job-posting.module";
import { WorkerModule } from "../worker/worker.module";
import { DeleteCompanyAccountUseCase } from "./application/use-cases/delete-company-account.use-case";
import { DeleteWorkerAccountUseCase } from "./application/use-cases/delete-worker-account.use-case";
import { ExportPersonalDataUseCase } from "./application/use-cases/export-personal-data.use-case";
import { PrismaPersonalDataReader } from "./infra/prisma-personal-data.reader";
import { PrivacyController } from "./privacy.controller";
import { PERSONAL_DATA_READER } from "./privacy.tokens";

// why: direitos do titular (LGPD art. 18) ficam num módulo próprio porque
// atravessam worker, company e job-posting; o aceite no cadastro continua nos
// módulos worker/company, via CONSENT_LOG do shared-kernel.
@Module({
  imports: [WorkerModule, CompanyModule, JobPostingModule],
  controllers: [PrivacyController],
  providers: [
    { provide: PERSONAL_DATA_READER, useClass: PrismaPersonalDataReader },
    ExportPersonalDataUseCase,
    DeleteWorkerAccountUseCase,
    DeleteCompanyAccountUseCase,
  ],
})
export class PrivacyModule {}
