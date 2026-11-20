import { randomUUID } from "node:crypto";
import { hostname } from "node:os";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JobLeaseService {
  private readonly logger = new Logger(JobLeaseService.name);
  private readonly owner = `${hostname()}:${process.pid}:${randomUUID()}`;

  constructor(private readonly prisma: PrismaService) {}

  // hazard: se `work` passar de `leaseMs`, outra réplica pode assumir o lease e
  // rodar em paralelo — dimensione `leaseMs` acima da duração máxima esperada.
  // Os jobs atuais são idempotentes, então isso custa só trabalho repetido.
  async runExclusive(
    name: string,
    leaseMs: number,
    work: () => Promise<void>,
  ): Promise<boolean> {
    // why: o relógio do banco é a única referência comum entre réplicas; usar
    // Date.now() de cada processo deixaria o lease à mercê de clock skew.
    const acquired = await this.prisma.$executeRaw`
      INSERT INTO "JobLease" ("name", "owner", "lockedUntil")
      VALUES (${name}, ${this.owner}, now() + (${leaseMs}::integer * interval '1 millisecond'))
      ON CONFLICT ("name") DO UPDATE
        SET "owner" = EXCLUDED."owner", "lockedUntil" = EXCLUDED."lockedUntil"
        WHERE "JobLease"."lockedUntil" < now()`;
    if (acquired === 0) {
      this.logger.debug(
        `Job ${name} já está rodando em outra réplica; pulando esta execução`,
      );
      return false;
    }

    try {
      await work();
    } finally {
      await this.release(name);
    }
    return true;
  }

  // why: uma falha ao liberar não pode mascarar o erro do próprio job; no pior
  // caso o lease vence sozinho em `leaseMs` e o job volta a rodar.
  private async release(name: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        UPDATE "JobLease" SET "lockedUntil" = now()
        WHERE "name" = ${name} AND "owner" = ${this.owner}`;
    } catch (error) {
      this.logger.error(`Falha ao liberar o lease do job ${name}`, error as Error);
    }
  }
}
