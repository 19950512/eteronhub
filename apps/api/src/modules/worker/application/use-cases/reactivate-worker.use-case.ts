import { Inject, Injectable } from "@nestjs/common";
import { WORKER_REPOSITORY } from "../../worker.tokens";
import { WorkerNotFoundError } from "../errors";
import { WorkerRepository } from "../ports/worker-repository.port";

@Injectable()
export class ReactivateWorkerUseCase {
  constructor(@Inject(WORKER_REPOSITORY) private readonly workerRepository: WorkerRepository) {}

  async execute(workerId: string): Promise<void> {
    const worker = await this.workerRepository.findById(workerId);
    if (!worker) {
      throw new WorkerNotFoundError(`Trabalhador não encontrado: ${workerId}`);
    }

    worker.reactivate();
    await this.workerRepository.save(worker);
  }
}
