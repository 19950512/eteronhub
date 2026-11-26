import { Inject, Injectable } from "@nestjs/common";
import { WORKER_REPOSITORY } from "../../worker.tokens";
import { WorkerProfileView } from "../../domain/worker.entity";
import { WorkerNotFoundError } from "../errors";
import { WorkerRepository } from "../ports/worker-repository.port";

@Injectable()
export class GetWorkerProfileUseCase {
  constructor(
    @Inject(WORKER_REPOSITORY) private readonly workerRepository: WorkerRepository,
  ) {}

  async execute(workerId: string): Promise<WorkerProfileView> {
    const worker = await this.workerRepository.findById(workerId);
    if (!worker) {
      throw new WorkerNotFoundError(`Trabalhador não encontrado: ${workerId}`);
    }
    return worker.toProfileView();
  }
}
