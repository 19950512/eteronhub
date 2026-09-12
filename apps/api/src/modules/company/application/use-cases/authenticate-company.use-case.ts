import { Inject, Injectable } from "@nestjs/common";
import { AuthTokenService } from "../../../../shared-kernel/application/auth-token-service.port";
import { InvalidCredentialsError } from "../../../../shared-kernel/application/errors";
import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { AUTH_TOKEN_SERVICE, PASSWORD_HASHER } from "../../../../shared-kernel/tokens";
import { COMPANY_REPOSITORY } from "../../company.tokens";
import { CompanyRepository } from "../ports/company-repository.port";

export interface AuthenticateCompanyInput {
  email: string;
  password: string;
}

export interface AuthenticateCompanyOutput {
  accessToken: string;
}

@Injectable()
export class AuthenticateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(AUTH_TOKEN_SERVICE) private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(input: AuthenticateCompanyInput): Promise<AuthenticateCompanyOutput> {
    const email = Email.create(input.email);
    const company = await this.companyRepository.findByEmail(email);
    if (!company) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, company.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.authTokenService.sign({ subject: company.id, role: "COMPANY" });
    return { accessToken };
  }
}
