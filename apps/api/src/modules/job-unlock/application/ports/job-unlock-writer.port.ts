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
 */
// invariant: o saldo nunca fica negativo nem perde atualização, inclusive com
// desbloqueios de vagas diferentes ou recargas concorrentes na mesma carteira.
export interface JobUnlockWriter {
  unlock(input: UnlockWriteInput): Promise<JobUnlockWriteResult>;
}
