import { Inject, Injectable } from "@nestjs/common";
import { AuthTokenService } from "../../../../shared-kernel/application/auth-token-service.port";
import { InvalidCredentialsError } from "../../../../shared-kernel/application/errors";
import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { AUTH_TOKEN_SERVICE, PASSWORD_HASHER } from "../../../../shared-kernel/tokens";
import { ADMIN_REPOSITORY } from "../../admin.tokens";
import { AdminRepository } from "../ports/admin-repository.port";

export interface AuthenticateAdminInput {
  email: string;
  password: string;
}

export interface AuthenticateAdminOutput {
  accessToken: string;
}

@Injectable()
export class AuthenticateAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(AUTH_TOKEN_SERVICE) private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(input: AuthenticateAdminInput): Promise<AuthenticateAdminOutput> {
    const email = Email.create(input.email);
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, admin.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.authTokenService.sign({ subject: admin.id, role: "ADMIN" });
    return { accessToken };
  }
}
