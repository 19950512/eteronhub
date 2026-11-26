import { Inject, Injectable } from "@nestjs/common";
import { BrazilianState } from "../../../../shared-kernel/domain/brazilian-state.vo";
import { PhoneNumber } from "../../../../shared-kernel/domain/phone-number.vo";
import { COMPANY_REPOSITORY } from "../../company.tokens";
import { CompanyProfileView } from "../../domain/company.entity";
import { parseCompanySector } from "../../domain/company-sector";
import { Website } from "../../domain/website.vo";
import { CompanyNotFoundError } from "../errors";
import { CompanyRepository } from "../ports/company-repository.port";

// invariant: substituição completa do perfil — campo ausente significa "limpar".
export interface UpdateCompanyProfileInput {
  nomeFantasia?: string | null;
  sector?: string | null;
  city?: string | null;
  state?: string | null;
  whatsapp?: string | null;
  website?: string | null;
}

function present(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

@Injectable()
export class UpdateCompanyProfileUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(
    companyId: string,
    input: UpdateCompanyProfileInput,
  ): Promise<CompanyProfileView> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new CompanyNotFoundError(`Empresa não encontrada: ${companyId}`);
    }

    company.updateProfile({
      nomeFantasia: input.nomeFantasia ?? null,
      sector: present(input.sector) ? parseCompanySector(input.sector) : null,
      city: input.city ?? null,
      state: present(input.state) ? BrazilianState.create(input.state) : null,
      whatsapp: present(input.whatsapp) ? PhoneNumber.create(input.whatsapp) : null,
      website: present(input.website) ? Website.create(input.website) : null,
    });

    await this.companyRepository.save(company);
    return company.toProfileView();
  }
}
