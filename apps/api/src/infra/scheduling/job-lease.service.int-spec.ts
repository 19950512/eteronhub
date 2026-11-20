import { randomUUID } from "node:crypto";
import { createIntegrationPrisma } from "../prisma/testing/integration-prisma";
import { JobLeaseService } from "./job-lease.service";

describe("JobLeaseService (Postgres)", () => {
  const prisma = createIntegrationPrisma();
  const jobNames: string[] = [];

  afterAll(async () => {
    await prisma.jobLease.deleteMany({ where: { name: { in: jobNames } } });
    await prisma.$disconnect();
  });

  function uniqueJobName(): string {
    const name = `it-job-${randomUUID()}`;
    jobNames.push(name);
    return name;
  }

  it("com várias réplicas disputando o mesmo job, só uma executa", async () => {
    const name = uniqueJobName();
    const replicas = Array.from({ length: 5 }, () => new JobLeaseService(prisma));
    let executions = 0;
    let releaseWork!: () => void;
    const workGate = new Promise<void>((resolve) => (releaseWork = resolve));

    const runs = replicas.map((replica) =>
      replica.runExclusive(name, 60_000, async () => {
        executions += 1;
        await workGate;
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    releaseWork();
    const results = await Promise.all(runs);

    expect(executions).toBe(1);
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it("libera o lease ao terminar, mesmo se o trabalho falhar", async () => {
    const name = uniqueJobName();
    const replicaA = new JobLeaseService(prisma);
    const replicaB = new JobLeaseService(prisma);

    await expect(
      replicaA.runExclusive(name, 60_000, async () => {
        throw new Error("falhou");
      }),
    ).rejects.toThrow("falhou");

    await expect(
      replicaB.runExclusive(name, 60_000, async () => undefined),
    ).resolves.toBe(true);
  });

  it("permite que outra réplica assuma um lease vencido (réplica que travou)", async () => {
    const name = uniqueJobName();
    await prisma.jobLease.create({
      data: { name, owner: "replica-morta", lockedUntil: new Date(Date.now() - 1000) },
    });

    await expect(
      new JobLeaseService(prisma).runExclusive(name, 60_000, async () => undefined),
    ).resolves.toBe(true);
  });
});
