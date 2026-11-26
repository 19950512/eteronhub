import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { GetCompanyProfileUseCase } from "./application/use-cases/get-company-profile.use-case";
import { UpdateCompanyProfileUseCase } from "./application/use-cases/update-company-profile.use-case";
import { CompanyProfileView } from "./domain/company.entity";
import { UpdateCompanyProfileDto } from "./dto/update-company-profile.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("COMPANY")
@Controller("companies/me/profile")
export class CompanyProfileController {
  constructor(
    private readonly getCompanyProfileUseCase: GetCompanyProfileUseCase,
    private readonly updateCompanyProfileUseCase: UpdateCompanyProfileUseCase,
  ) {}

  @Get()
  async get(@CurrentUser() user: AuthTokenPayload): Promise<CompanyProfileView> {
    return this.getCompanyProfileUseCase.execute(user.subject);
  }

  @Put()
  async update(
    @CurrentUser() user: AuthTokenPayload,
    @Body() dto: UpdateCompanyProfileDto,
  ): Promise<CompanyProfileView> {
    return this.updateCompanyProfileUseCase.execute(user.subject, dto);
  }
}
