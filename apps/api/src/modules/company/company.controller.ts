import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AUTH_THROTTLE } from "../../infra/http/rate-limits";
import { RegisterCompanyUseCase } from "./application/use-cases/register-company.use-case";
import { RegisterCompanyDto } from "./dto/register-company.dto";

@Controller("companies")
export class CompanyController {
  constructor(private readonly registerCompanyUseCase: RegisterCompanyUseCase) {}

  @Throttle(AUTH_THROTTLE)
  @Post()
  async register(@Body() dto: RegisterCompanyDto): Promise<{ id: string }> {
    const { companyId } = await this.registerCompanyUseCase.execute(dto);
    return { id: companyId };
  }
}
