import { Inject, Injectable } from "@nestjs/common";
import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Cnpj } from "../../../../shared-kernel/domain/cnpj.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { Password } from "../../../../shared-kernel/domain/password.vo";
import { PASSWORD_HASHER } from "../../../../shared-kernel/tokens";
import { COMPANY_REPOSITORY } from "../../company.tokens";
import { Company } from "../../domain/company.entity";
import { CnpjAlreadyRegisteredError, EmailAlreadyRegisteredError } from "../errors";
import { CompanyRepository } from "../ports/company-repository.port";

export interface RegisterCompanyInput {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  email: string;
  password: string;
}

export interface RegisterCompanyOutput {
  companyId: string;
}

@Injectable()
export class RegisterCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterCompanyInput): Promise<RegisterCompanyOutput> {
    const cnpj = Cnpj.create(input.cnpj);
    const email = Email.create(input.email);
    Password.create(input.password);

    if (await this.companyRepository.existsByCnpj(cnpj)) {
      throw new CnpjAlreadyRegisteredError(`Já existe uma empresa cadastrada com o CNPJ ${cnpj.format()}`);
    }
    if (await this.companyRepository.existsByEmail(email)) {
      throw new EmailAlreadyRegisteredError(`Já existe uma conta cadastrada com o e-mail ${email.value}`);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const company = Company.register({
      cnpj,
      razaoSocial: input.razaoSocial,
      nomeFantasia: input.nomeFantasia,
      email,
      passwordHash,
    });

    await this.companyRepository.save(company);

    return { companyId: company.id };
  }
}
