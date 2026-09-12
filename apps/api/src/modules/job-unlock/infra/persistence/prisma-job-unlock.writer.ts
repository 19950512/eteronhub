import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { JobUnlock as JobUnlockRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { CreditWallet } from "../../../credit/domain/credit-wallet.entity";
import { JobUnlock } from "../../domain/job-unlock.entity";
import { JobUnlockWriteResult, JobUnlockWriter, UnlockWriteInput } from "../../application/ports/job-unlock-writer.port";

/**
 * Implementa a atomicidade exigida pelas regras 11-14 com uma transação do
 * Prisma apoiada por uma constraint única em JobUnlock(workerId,
 * jobPostingId) (ver prisma/schema.prisma):
 *
 * 1. Dentro da transação, reconfirma que não existe desbloqueio para o par
 *    (a checagem fora da transação, no caso de uso, não protege contra a
 *    corrida entre duas transações concorrentes).
 * 2. Debita a carteira e cria o registro de desbloqueio.
 * 3. Se duas transações concorrentes chegam ao passo 1 vendo "não existe" e
 *    ambas tentam inserir o JobUnlock, a constraint única deixa só uma
 *    inserção passar — a outra falha com uma violação (P2002), o que
 *    desfaz (rollback) TODA a transação dela, inclusive o débito que já
 *    tinha feito. O catch abaixo trata essa falha buscando o desbloqueio
 *    que a transação vencedora já commitou, em vez de propagar o erro.
 *
 * Essa garantia cobre especificamente o par (workerId, jobPostingId) — não
 * é uma trava geral contra corridas de débito entre vagas diferentes na
 * mesma carteira (ver job-unlock-writer.port.ts).
 */
@Injectable()
export class PrismaJobUnlockWriter implements JobUnlockWriter {
  constructor(private readonly prisma: PrismaService) {}

  async unlock(input: UnlockWriteInput): Promise<JobUnlockWriteResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingRecord = await tx.jobUnlock.findUnique({
          where: { workerId_jobPostingId: { workerId: input.workerId, jobPostingId: input.jobPostingId } },
        });
        if (existingRecord) {
          return { jobUnlock: this.toDomain(existingRecord), alreadyExisted: true };
        }

        const walletRecord = await tx.creditWallet.upsert({
          where: { workerId: input.workerId },
          create: { id: randomUUID(), workerId: input.workerId, balance: 0 },
          update: {},
        });
        const wallet = CreditWallet.restore({
          id: walletRecord.id,
          workerId: walletRecord.workerId,
          balance: CreditAmount.of(walletRecord.balance),
          updatedAt: walletRecord.updatedAt,
        });

        // Lança InsufficientCreditsError se o saldo for menor que o custo —
        // a exceção propaga e a transação inteira é revertida, sem nenhuma
        // escrita parcial.
        wallet.debit(input.unlockCost);

        await tx.creditWallet.update({
          where: { id: wallet.id },
          data: { balance: wallet.balance.value, updatedAt: wallet.updatedAt },
        });

        const jobUnlock = JobUnlock.create({
          workerId: input.workerId,
          jobPostingId: input.jobPostingId,
          creditsSpent: input.unlockCost,
        });

        await tx.creditTransaction.create({
          data: {
            id: randomUUID(),
            walletId: wallet.id,
            type: "DEBIT",
            amount: input.unlockCost.value,
            relatedJobUnlockId: jobUnlock.id,
          },
        });

        await tx.jobUnlock.create({
          data: {
            id: jobUnlock.id,
            workerId: jobUnlock.workerId,
            jobPostingId: jobUnlock.jobPostingId,
            creditsSpent: jobUnlock.creditsSpent.value,
            unlockedAt: jobUnlock.unlockedAt,
          },
        });

        return { jobUnlock, alreadyExisted: false };
      });
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        const existing = await this.prisma.jobUnlock.findUnique({
          where: { workerId_jobPostingId: { workerId: input.workerId, jobPostingId: input.jobPostingId } },
        });
        if (existing) {
          return { jobUnlock: this.toDomain(existing), alreadyExisted: true };
        }
      }
      throw error;
    }
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }

  private toDomain(record: JobUnlockRecord): JobUnlock {
    return JobUnlock.restore({
      id: record.id,
      workerId: record.workerId,
      jobPostingId: record.jobPostingId,
      creditsSpent: CreditAmount.of(record.creditsSpent),
      unlockedAt: record.unlockedAt,
    });
  }
}
