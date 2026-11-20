import { randomUUID } from "node:crypto";
import { createIntegrationPrisma } from "../../../../infra/prisma/testing/integration-prisma";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { Money } from "../../../../shared-kernel/domain/money.vo";
import { Payment } from "../../domain/payment.entity";
import { PrismaPaymentConfirmationWriter } from "./prisma-payment-confirmation.writer";
import { PrismaPaymentRepository } from "./prisma-payment.repository";

describe("PrismaPaymentConfirmationWriter (Postgres)", () => {
  const prisma = createIntegrationPrisma();
  const writer = new PrismaPaymentConfirmationWriter(prisma);
  const repository = new PrismaPaymentRepository(prisma);
  const workerIds: string[] = [];

  afterAll(async () => {
    const wallets = await prisma.creditWallet.findMany({
      where: { workerId: { in: workerIds } },
    });
    await prisma.creditTransaction.deleteMany({
      where: { walletId: { in: wallets.map((w) => w.id) } },
    });
    await prisma.creditWallet.deleteMany({ where: { workerId: { in: workerIds } } });
    await prisma.payment.deleteMany({ where: { workerId: { in: workerIds } } });
    await prisma.$disconnect();
  });

  async function persistedPayment(expiresInMs = 60_000): Promise<Payment> {
    const workerId = `it-worker-${randomUUID()}`;
    workerIds.push(workerId);
    const payment = Payment.create({
      workerId,
      creditPackageId: "it-package",
      amount: Money.fromCents(2000),
      creditsAmount: CreditAmount.of(20),
      expiresAt: new Date(Date.now() + expiresInMs),
    });
    await repository.save(payment);
    return payment;
  }

  function confirm(payment: Payment): Promise<boolean> {
    return writer.confirmAndCredit({
      paymentId: payment.id,
      workerId: payment.workerId,
      creditsAmount: payment.creditsAmount,
      e2eId: "E2E-IT",
      confirmedAt: new Date(),
    });
  }

  it("credita exatamente uma vez com 10 confirmações concorrentes (webhook + reconciliação)", async () => {
    const payment = await persistedPayment();

    const results = await Promise.all(Array.from({ length: 10 }, () => confirm(payment)));

    expect(results.filter(Boolean)).toHaveLength(1);
    const wallet = await prisma.creditWallet.findUniqueOrThrow({
      where: { workerId: payment.workerId },
    });
    expect(wallet.balance).toBe(20);
    expect(
      await prisma.creditTransaction.count({ where: { relatedPaymentId: payment.id } }),
    ).toBe(1);
    expect((await repository.findById(payment.id))?.status).toBe("CONFIRMED");
  });

  it("confirma e credita um pagamento que já estava EXPIRED (RN-19)", async () => {
    const payment = await persistedPayment(-1);
    payment.expire();
    await repository.markExpiredIfPending(payment);

    await expect(confirm(payment)).resolves.toBe(true);

    const wallet = await prisma.creditWallet.findUniqueOrThrow({
      where: { workerId: payment.workerId },
    });
    expect(wallet.balance).toBe(20);
  });

  it("markExpiredIfPending não sobrescreve um pagamento confirmado concorrentemente", async () => {
    const payment = await persistedPayment(-1);
    await confirm(payment);

    payment.expire();
    await expect(repository.markExpiredIfPending(payment)).resolves.toBe(false);
    expect((await repository.findById(payment.id))?.status).toBe("CONFIRMED");
  });

  it("não perde a recarga quando um débito concorre na mesma carteira", async () => {
    const payment = await persistedPayment();
    await prisma.creditWallet.create({
      data: { id: randomUUID(), workerId: payment.workerId, balance: 100 },
    });

    await Promise.all([
      confirm(payment),
      ...Array.from({ length: 5 }, () =>
        prisma.creditWallet.update({
          where: { workerId: payment.workerId },
          data: { balance: { decrement: 1 } },
        }),
      ),
    ]);

    const wallet = await prisma.creditWallet.findUniqueOrThrow({
      where: { workerId: payment.workerId },
    });
    expect(wallet.balance).toBe(100 + 20 - 5);
  });
});
