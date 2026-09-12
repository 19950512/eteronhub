import { Injectable } from "@nestjs/common";
import { UnitOfWork } from "../../shared-kernel/application/unit-of-work.port";
import { PrismaService } from "./prisma.service";

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  // Repositórios criados nas próximas fases precisarão aceitar o client
  // transacional do Prisma para de fato participarem desta transação.
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async () => work());
  }
}
