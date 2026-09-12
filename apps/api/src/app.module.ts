import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./infra/prisma/prisma.module";
import { AdminModule } from "./modules/admin/admin.module";
import { CompanyModule } from "./modules/company/company.module";
import { JobPostingModule } from "./modules/job-posting/job-posting.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
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
  ],
  controllers: [HealthController],
})
export class AppModule {}
