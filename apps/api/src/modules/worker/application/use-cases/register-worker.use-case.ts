import { Inject, Injectable } from "@nestjs/common";
import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Cpf } from "../../../../shared-kernel/domain/cpf.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { Password } from "../../../../shared-kernel/domain/password.vo";
import { PASSWORD_HASHER } from "../../../../shared-kernel/tokens";
import { WORKER_REPOSITORY } from "../../worker.tokens";
import { Worker } from "../../domain/worker.entity";
import { CpfAlreadyRegisteredError, WorkerEmailAlreadyRegisteredError } from "../errors";
import { WorkerRepository } from "../ports/worker-repository.port";

export interface RegisterWorkerInput {
  cpf: string;
  nome: string;
  email: string;
  password: string;
}

export interface RegisterWorkerOutput {
  workerId: string;
}

@Injectable()
export class RegisterWorkerUseCase {
  constructor(
    @Inject(WORKER_REPOSITORY) private readonly workerRepository: WorkerRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterWorkerInput): Promise<RegisterWorkerOutput> {
    const cpf = Cpf.create(input.cpf);
    const email = Email.create(input.email);
    Password.create(input.password);

    if (await this.workerRepository.existsByCpf(cpf)) {
      throw new CpfAlreadyRegisteredError(`Já existe um trabalhador cadastrado com o CPF ${cpf.format()}`);
    }
    if (await this.workerRepository.existsByEmail(email)) {
      throw new WorkerEmailAlreadyRegisteredError(`Já existe uma conta cadastrada com o e-mail ${email.value}`);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const worker = Worker.register({
      cpf,
      nome: input.nome,
      email,
      passwordHash,
    });

    await this.workerRepository.save(worker);

    return { workerId: worker.id };
  }
}
