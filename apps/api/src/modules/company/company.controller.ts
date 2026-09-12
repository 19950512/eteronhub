import { Body, Controller, Post } from "@nestjs/common";
import { RegisterCompanyUseCase } from "./application/use-cases/register-company.use-case";
import { RegisterCompanyDto } from "./dto/register-company.dto";

@Controller("companies")
export class CompanyController {
  constructor(private readonly registerCompanyUseCase: RegisterCompanyUseCase) {}

  @Post()
  async register(@Body() dto: RegisterCompanyDto): Promise<{ id: string }> {
    const { companyId } = await this.registerCompanyUseCase.execute(dto);
    return { id: companyId };
  }
}
