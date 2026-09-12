import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
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
    // Limite padrão para toda a API; endpoints sensíveis (login, cadastro,
    // webhook) aplicam um limite mais rígido via @Throttle() no controller.
    ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 100 }]),
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
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
