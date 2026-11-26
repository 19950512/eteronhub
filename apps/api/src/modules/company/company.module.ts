import { Module } from "@nestjs/common";
import { AuthenticateCompanyUseCase } from "./application/use-cases/authenticate-company.use-case";
import { ReactivateCompanyUseCase } from "./application/use-cases/reactivate-company.use-case";
import { RegisterCompanyUseCase } from "./application/use-cases/register-company.use-case";
import { SuspendCompanyUseCase } from "./application/use-cases/suspend-company.use-case";
import { COMPANY_REPOSITORY } from "./company.tokens";
import { CompanyController } from "./company.controller";
import { CompanyProfileController } from "./company-profile.controller";
import { GetCompanyProfileUseCase } from "./application/use-cases/get-company-profile.use-case";
import { UpdateCompanyProfileUseCase } from "./application/use-cases/update-company-profile.use-case";
import { PrismaCompanyRepository } from "./infra/persistence/prisma-company.repository";

@Module({
  controllers: [CompanyController, CompanyProfileController],
  providers: [
    { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository },
    RegisterCompanyUseCase,
    SuspendCompanyUseCase,
    ReactivateCompanyUseCase,
    AuthenticateCompanyUseCase,
    GetCompanyProfileUseCase,
    UpdateCompanyProfileUseCase,
  ],
  exports: [
    COMPANY_REPOSITORY,
    SuspendCompanyUseCase,
    ReactivateCompanyUseCase,
    AuthenticateCompanyUseCase,
  ],
})
export class CompanyModule {}
