import { Injectable } from "@nestjs/common";
import type { CreditTransaction as CreditTransactionRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { CreditTransactionRepository } from "../../application/ports/credit-transaction-repository.port";
import { CreditTransaction, CreditTransactionType } from "../../domain/credit-transaction.entity";

@Injectable()
export class PrismaCreditTransactionRepository implements CreditTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(transaction: CreditTransaction): Promise<void> {
    await this.prisma.creditTransaction.create({
      data: {
        id: transaction.id,
        walletId: transaction.walletId,
        type: transaction.type,
        amount: transaction.amount.value,
        relatedPaymentId: transaction.relatedPaymentId,
        relatedJobUnlockId: transaction.relatedJobUnlockId,
        createdAt: transaction.createdAt,
      },
    });
  }

  async findByWallet(walletId: string): Promise<CreditTransaction[]> {
    const records = await this.prisma.creditTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: "asc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: CreditTransactionRecord): CreditTransaction {
    return CreditTransaction.restore({
      id: record.id,
      walletId: record.walletId,
      type: record.type as CreditTransactionType,
      amount: CreditAmount.of(record.amount),
      relatedPaymentId: record.relatedPaymentId,
      relatedJobUnlockId: record.relatedJobUnlockId,
      createdAt: record.createdAt,
    });
  }
}
