import { Inject, Injectable, Logger } from "@nestjs/common";
import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { PASSWORD_HASHER } from "../../../../shared-kernel/tokens";
import { WorkerRepository } from "../../../worker/application/ports/worker-repository.port";
import { WORKER_REPOSITORY } from "../../../worker/worker.tokens";
import { AccountNotFoundError, DeletionPasswordMismatchError } from "../errors";

@Injectable()
export class DeleteWorkerAccountUseCase {
  private readonly logger = new Logger(DeleteWorkerAccountUseCase.name);

  constructor(
    @Inject(WORKER_REPOSITORY) private readonly workerRepository: WorkerRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(workerId: string, password: string, now = new Date()): Promise<void> {
    const worker = await this.workerRepository.findById(workerId);
    if (!worker) {
      throw new AccountNotFoundError();
    }
    if (!(await this.passwordHasher.compare(password, worker.passwordHash))) {
      throw new DeletionPasswordMismatchError();
    }

    worker.deleteAccount(now);
    await this.workerRepository.save(worker);

    this.logger.log(`Conta de trabalhador ${workerId} excluída a pedido do titular`);
  }
}
