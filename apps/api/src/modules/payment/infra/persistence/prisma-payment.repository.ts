import { Injectable } from "@nestjs/common";
import type { Payment as PaymentRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { Money } from "../../../../shared-kernel/domain/money.vo";
import { PaymentRepository } from "../../application/ports/payment-repository.port";
import { Payment, PaymentStatus } from "../../domain/payment.entity";

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(payment: Payment): Promise<void> {
    await this.prisma.payment.upsert({
      where: { id: payment.id },
      create: {
        id: payment.id,
        workerId: payment.workerId,
        creditPackageId: payment.creditPackageId,
        amountCents: payment.amount.valueInCents,
        creditsAmount: payment.creditsAmount.value,
        status: payment.status,
        pixTxId: payment.pixTxId,
        pixE2eId: payment.pixE2eId,
        createdAt: payment.createdAt,
        expiresAt: payment.expiresAt,
        confirmedAt: payment.confirmedAt,
      },
      update: {
        status: payment.status,
        pixE2eId: payment.pixE2eId,
        confirmedAt: payment.confirmedAt,
      },
    });
  }

  async findById(id: string): Promise<Payment | null> {
    const record = await this.prisma.payment.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByPixTxId(pixTxId: string): Promise<Payment | null> {
    const record = await this.prisma.payment.findUnique({ where: { pixTxId } });
    return record ? this.toDomain(record) : null;
  }

  async findPendingExpiredBefore(now: Date): Promise<Payment[]> {
    const records = await this.prisma.payment.findMany({
      where: { status: "PENDING", expiresAt: { lte: now } },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findPendingOlderThan(threshold: Date): Promise<Payment[]> {
    const records = await this.prisma.payment.findMany({
      where: { status: "PENDING", createdAt: { lte: threshold } },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: PaymentRecord): Payment {
    return Payment.restore({
      id: record.id,
      workerId: record.workerId,
      creditPackageId: record.creditPackageId,
      amount: Money.fromCents(record.amountCents),
      creditsAmount: CreditAmount.of(record.creditsAmount),
      status: record.status as PaymentStatus,
      pixTxId: record.pixTxId,
      pixE2eId: record.pixE2eId,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      confirmedAt: record.confirmedAt,
    });
  }
}
