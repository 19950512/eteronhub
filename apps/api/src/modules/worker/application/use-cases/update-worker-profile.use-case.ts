import { Inject, Injectable } from "@nestjs/common";
import { PhoneNumber } from "../../../../shared-kernel/domain/phone-number.vo";
import { WORKER_REPOSITORY } from "../../worker.tokens";
import { WorkerProfileView } from "../../domain/worker.entity";
import { parseWorkerSegment } from "../../domain/worker-segment";
import { WorkerSoftware } from "../../domain/worker-software.vo";
import { WorkerNotFoundError } from "../errors";
import { WorkerRepository } from "../ports/worker-repository.port";

// invariant: substituição completa do perfil — campo ausente significa "limpar".
export interface UpdateWorkerProfileInput {
  phone?: string | null;
  bio?: string | null;
  segments?: string[];
  softwares?: { name: string; version?: string | null }[];
}

@Injectable()
export class UpdateWorkerProfileUseCase {
  constructor(
    @Inject(WORKER_REPOSITORY) private readonly workerRepository: WorkerRepository,
  ) {}

  async execute(
    workerId: string,
    input: UpdateWorkerProfileInput,
  ): Promise<WorkerProfileView> {
    const worker = await this.workerRepository.findById(workerId);
    if (!worker) {
      throw new WorkerNotFoundError(`Trabalhador não encontrado: ${workerId}`);
    }

    worker.updateProfile({
      phone: input.phone?.trim() ? PhoneNumber.create(input.phone) : null,
      bio: input.bio ?? null,
      segments: (input.segments ?? []).map(parseWorkerSegment),
      softwares: (input.softwares ?? []).map((software) =>
        WorkerSoftware.create(software),
      ),
    });

    await this.workerRepository.save(worker);
    return worker.toProfileView();
  }
}
