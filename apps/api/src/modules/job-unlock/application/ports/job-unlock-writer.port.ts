import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { JobUnlock } from "../../domain/job-unlock.entity";

export interface UnlockWriteInput {
  workerId: string;
  jobPostingId: string;
  unlockCost: CreditAmount;
}

export interface JobUnlockWriteResult {
  jobUnlock: JobUnlock;
  alreadyExisted: boolean;
}

/**
 * Executa atomicamente, para o par (workerId, jobPostingId): se já existe um
 * JobUnlock, retorna-o sem debitar créditos de novo (idempotência, regra 13).
 * Caso contrário, debita `unlockCost` da carteira do trabalhador e cria o
 * JobUnlock — as duas escritas ocorrem juntas ou nenhuma ocorre (regra 14).
 *
 * A garantia de atomicidade cobre especificamente chamadas concorrentes para
 * o MESMO par (workerId, jobPostingId) — não é uma garantia geral contra
 * corridas entre débitos de vagas diferentes na mesma carteira, que ainda
 * seguem um padrão ler-modificar-escrever (ver PrismaJobUnlockWriter).
 */
export interface JobUnlockWriter {
  unlock(input: UnlockWriteInput): Promise<JobUnlockWriteResult>;
}
