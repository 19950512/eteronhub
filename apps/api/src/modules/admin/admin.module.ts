import { Module } from "@nestjs/common";
import { CompanyModule } from "../company/company.module";
import { WorkerModule } from "../worker/worker.module";
import { AdminController } from "./admin.controller";
import { ADMIN_REPOSITORY } from "./admin.tokens";
import { AuthenticateAdminUseCase } from "./application/use-cases/authenticate-admin.use-case";
import { PrismaAdminRepository } from "./infra/persistence/prisma-admin.repository";

@Module({
  imports: [CompanyModule, WorkerModule],
  controllers: [AdminController],
  providers: [{ provide: ADMIN_REPOSITORY, useClass: PrismaAdminRepository }, AuthenticateAdminUseCase],
})
export class AdminModule {}
