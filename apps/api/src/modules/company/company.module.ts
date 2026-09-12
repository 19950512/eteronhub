import { Module } from "@nestjs/common";
import { AuthenticateCompanyUseCase } from "./application/use-cases/authenticate-company.use-case";
import { ReactivateCompanyUseCase } from "./application/use-cases/reactivate-company.use-case";
import { RegisterCompanyUseCase } from "./application/use-cases/register-company.use-case";
import { SuspendCompanyUseCase } from "./application/use-cases/suspend-company.use-case";
import { COMPANY_REPOSITORY } from "./company.tokens";
import { CompanyController } from "./company.controller";
import { PrismaCompanyRepository } from "./infra/persistence/prisma-company.repository";

@Module({
  controllers: [CompanyController],
  providers: [
    { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository },
    RegisterCompanyUseCase,
    SuspendCompanyUseCase,
    ReactivateCompanyUseCase,
    AuthenticateCompanyUseCase,
  ],
  exports: [COMPANY_REPOSITORY, SuspendCompanyUseCase, ReactivateCompanyUseCase, AuthenticateCompanyUseCase],
})
export class CompanyModule {}
