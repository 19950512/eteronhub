import { Body, Controller, Headers, Ip, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AUTH_THROTTLE } from "../../infra/http/rate-limits";
import { RegisterCompanyUseCase } from "./application/use-cases/register-company.use-case";
import { RegisterCompanyDto } from "./dto/register-company.dto";

@Controller("companies")
export class CompanyController {
  constructor(private readonly registerCompanyUseCase: RegisterCompanyUseCase) {}

  @Throttle(AUTH_THROTTLE)
  @Post()
  async register(
    @Body() dto: RegisterCompanyDto,
    @Ip() ipAddress: string | undefined,
    @Headers("user-agent") userAgent: string | undefined,
  ): Promise<{ id: string }> {
    const { acceptTerms, acceptPrivacyPolicy, confirmAdult, ...account } = dto;
    const { companyId } = await this.registerCompanyUseCase.execute({
      ...account,
      consent: { acceptTerms, acceptPrivacyPolicy, confirmAdult },
      context: { ipAddress: ipAddress ?? null, userAgent: userAgent ?? null },
    });
    return { id: companyId };
  }
}
