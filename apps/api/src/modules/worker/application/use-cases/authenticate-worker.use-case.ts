import { Inject, Injectable } from "@nestjs/common";
import { AuthTokenService } from "../../../../shared-kernel/application/auth-token-service.port";
import { InvalidCredentialsError } from "../../../../shared-kernel/application/errors";
import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { AUTH_TOKEN_SERVICE, PASSWORD_HASHER } from "../../../../shared-kernel/tokens";
import { WORKER_REPOSITORY } from "../../worker.tokens";
import { WorkerRepository } from "../ports/worker-repository.port";

export interface AuthenticateWorkerInput {
  email: string;
  password: string;
}

export interface AuthenticateWorkerOutput {
  accessToken: string;
}

@Injectable()
export class AuthenticateWorkerUseCase {
  constructor(
    @Inject(WORKER_REPOSITORY) private readonly workerRepository: WorkerRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(AUTH_TOKEN_SERVICE) private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(input: AuthenticateWorkerInput): Promise<AuthenticateWorkerOutput> {
    const email = Email.create(input.email);
    const worker = await this.workerRepository.findByEmail(email);
    if (!worker) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, worker.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.authTokenService.sign({ subject: worker.id, role: "WORKER" });
    return { accessToken };
  }
}
