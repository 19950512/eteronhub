import { Cpf } from "../../../../shared-kernel/domain/cpf.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { Worker } from "../../domain/worker.entity";

export interface WorkerRepository {
  save(worker: Worker): Promise<void>;
  findById(id: string): Promise<Worker | null>;
  findByCpf(cpf: Cpf): Promise<Worker | null>;
  findByEmail(email: Email): Promise<Worker | null>;
  existsByCpf(cpf: Cpf): Promise<boolean>;
  existsByEmail(email: Email): Promise<boolean>;
}
