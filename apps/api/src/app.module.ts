import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./infra/prisma/prisma.module";
import { AdminModule } from "./modules/admin/admin.module";
import { CompanyModule } from "./modules/company/company.module";
import { CreditModule } from "./modules/credit/credit.module";
import { JobPostingCatalogModule } from "./modules/job-posting/job-posting-catalog.module";
import { JobPostingModule } from "./modules/job-posting/job-posting.module";
import { JobUnlockModule } from "./modules/job-unlock/job-unlock.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { WorkerModule } from "./modules/worker/worker.module";
import { SharedKernelModule } from "./shared-kernel/shared-kernel.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    SharedKernelModule,
    CompanyModule,
    WorkerModule,
    AdminModule,
    AuthModule,
    JobPostingModule,
    ModerationModule,
    CreditModule,
    PaymentModule,
    JobUnlockModule,
    JobPostingCatalogModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
