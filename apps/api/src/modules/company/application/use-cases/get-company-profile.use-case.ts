import { Inject, Injectable } from "@nestjs/common";
import { COMPANY_REPOSITORY } from "../../company.tokens";
import { CompanyProfileView } from "../../domain/company.entity";
import { CompanyNotFoundError } from "../errors";
import { CompanyRepository } from "../ports/company-repository.port";

@Injectable()
export class GetCompanyProfileUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(companyId: string): Promise<CompanyProfileView> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new CompanyNotFoundError(`Empresa não encontrada: ${companyId}`);
    }
    return company.toProfileView();
  }
}
