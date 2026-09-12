import { JobUnlock } from "../../domain/job-unlock.entity";

// Somente leitura: toda escrita de JobUnlock passa pelo JobUnlockWriter (ver
// job-unlock-writer.port.ts), que garante a atomicidade exigida pelas
// regras 11-14. Este port serve o checkout rápido de idempotência e o
// histórico do trabalhador.
export interface JobUnlockRepository {
  findByWorkerAndJobPosting(workerId: string, jobPostingId: string): Promise<JobUnlock | null>;
  findByWorker(workerId: string): Promise<JobUnlock[]>;
}
