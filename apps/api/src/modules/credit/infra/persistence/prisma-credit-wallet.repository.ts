import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type { CreditWallet as CreditWalletRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { CreditWalletRepository } from "../../application/ports/credit-wallet-repository.port";
import { CreditWallet } from "../../domain/credit-wallet.entity";

@Injectable()
export class PrismaCreditWalletRepository implements CreditWalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(wallet: CreditWallet): Promise<void> {
    await this.prisma.creditWallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance.value, updatedAt: wallet.updatedAt },
    });
  }

  async findByWorkerId(workerId: string): Promise<CreditWallet | null> {
    const record = await this.prisma.creditWallet.findUnique({ where: { workerId } });
    return record ? this.toDomain(record) : null;
  }

  async getOrCreateForWorker(workerId: string): Promise<CreditWallet> {
    const record = await this.prisma.creditWallet.upsert({
      where: { workerId },
      create: { id: randomUUID(), workerId, balance: 0 },
      update: {},
    });
    return this.toDomain(record);
  }

  private toDomain(record: CreditWalletRecord): CreditWallet {
    return CreditWallet.restore({
      id: record.id,
      workerId: record.workerId,
      balance: CreditAmount.of(record.balance),
      updatedAt: record.updatedAt,
    });
  }
}
