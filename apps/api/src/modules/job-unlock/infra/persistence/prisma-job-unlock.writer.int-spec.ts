import { randomUUID } from "node:crypto";
import { createIntegrationPrisma } from "../../../../infra/prisma/testing/integration-prisma";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { InsufficientCreditsError } from "../../../credit/domain/credit-wallet.entity";
import { PrismaJobUnlockWriter } from "./prisma-job-unlock.writer";

describe("PrismaJobUnlockWriter (Postgres)", () => {
  const prisma = createIntegrationPrisma();
  const writer = new PrismaJobUnlockWriter(prisma);
  const workerIds: string[] = [];

  afterAll(async () => {
    const wallets = await prisma.creditWallet.findMany({
      where: { workerId: { in: workerIds } },
    });
    await prisma.creditTransaction.deleteMany({
      where: { walletId: { in: wallets.map((w) => w.id) } },
    });
    await prisma.jobUnlock.deleteMany({ where: { workerId: { in: workerIds } } });
    await prisma.creditWallet.deleteMany({ where: { workerId: { in: workerIds } } });
    await prisma.$disconnect();
  });

  async function workerWithBalance(balance: number): Promise<string> {
    const workerId = `it-worker-${randomUUID()}`;
    workerIds.push(workerId);
    await prisma.creditWallet.create({ data: { id: randomUUID(), workerId, balance } });
    return workerId;
  }

  function unlock(workerId: string, cost: number) {
    return writer.unlock({
      workerId,
      jobPostingId: `it-job-${randomUUID()}`,
      unlockCost: CreditAmount.of(cost),
    });
  }

  it("com saldo para um só desbloqueio, dois desbloqueios concorrentes de vagas diferentes: só um passa", async () => {
    const workerId = await workerWithBalance(10);

    const results = await Promise.allSettled([
      unlock(workerId, 10),
      unlock(workerId, 10),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );
    expect(rejected?.reason).toBeInstanceOf(InsufficientCreditsError);
    const wallet = await prisma.creditWallet.findUniqueOrThrow({ where: { workerId } });
    expect(wallet.balance).toBe(0);
    expect(await prisma.jobUnlock.count({ where: { workerId } })).toBe(1);
  });

  it("muitos desbloqueios concorrentes nunca deixam o saldo negativo nem cobram sem registrar", async () => {
    const workerId = await workerWithBalance(10);

    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => unlock(workerId, 3)),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    expect(succeeded).toBe(3);
    const wallet = await prisma.creditWallet.findUniqueOrThrow({ where: { workerId } });
    expect(wallet.balance).toBe(1);
    expect(await prisma.jobUnlock.count({ where: { workerId } })).toBe(succeeded);
    const debits = await prisma.creditTransaction.count({
      where: { walletId: wallet.id, type: "DEBIT" },
    });
    expect(debits).toBe(succeeded);
  });
});
