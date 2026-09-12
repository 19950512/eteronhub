import { Inject, Injectable } from "@nestjs/common";
import { COMPANY_REPOSITORY } from "../../company.tokens";
import { CompanyNotFoundError } from "../errors";
import { CompanyRepository } from "../ports/company-repository.port";

@Injectable()
export class SuspendCompanyUseCase {
  constructor(@Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository) {}

  async execute(companyId: string): Promise<void> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new CompanyNotFoundError(`Empresa não encontrada: ${companyId}`);
    }

    company.suspend();
    await this.companyRepository.save(company);
  }
}
