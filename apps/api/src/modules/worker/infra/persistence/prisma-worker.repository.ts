import { Injectable } from "@nestjs/common";
import type { Worker as WorkerRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { Cpf } from "../../../../shared-kernel/domain/cpf.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { WorkerRepository } from "../../application/ports/worker-repository.port";
import { Worker, WorkerStatus } from "../../domain/worker.entity";

@Injectable()
export class PrismaWorkerRepository implements WorkerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(worker: Worker): Promise<void> {
    await this.prisma.worker.upsert({
      where: { id: worker.id },
      create: {
        id: worker.id,
        cpf: worker.cpf.value,
        nome: worker.nome,
        email: worker.email.value,
        passwordHash: worker.passwordHash,
        status: worker.status,
        createdAt: worker.createdAt,
      },
      update: {
        nome: worker.nome,
        email: worker.email.value,
        passwordHash: worker.passwordHash,
        status: worker.status,
      },
    });
  }

  async findById(id: string): Promise<Worker | null> {
    const record = await this.prisma.worker.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByCpf(cpf: Cpf): Promise<Worker | null> {
    const record = await this.prisma.worker.findUnique({ where: { cpf: cpf.value } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<Worker | null> {
    const record = await this.prisma.worker.findUnique({ where: { email: email.value } });
    return record ? this.toDomain(record) : null;
  }

  async existsByCpf(cpf: Cpf): Promise<boolean> {
    const count = await this.prisma.worker.count({ where: { cpf: cpf.value } });
    return count > 0;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.worker.count({ where: { email: email.value } });
    return count > 0;
  }

  private toDomain(record: WorkerRecord): Worker {
    return Worker.restore({
      id: record.id,
      cpf: Cpf.create(record.cpf),
      nome: record.nome,
      email: Email.create(record.email),
      passwordHash: record.passwordHash,
      status: record.status as WorkerStatus,
      createdAt: record.createdAt,
    });
  }
}
