import { Injectable } from "@nestjs/common";
import type { Admin as AdminRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { AdminRepository } from "../../application/ports/admin-repository.port";
import { Admin } from "../../domain/admin.entity";

@Injectable()
export class PrismaAdminRepository implements AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Admin | null> {
    const record = await this.prisma.admin.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<Admin | null> {
    const record = await this.prisma.admin.findUnique({ where: { email: email.value } });
    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: AdminRecord): Admin {
    return Admin.restore({
      id: record.id,
      name: record.name,
      email: Email.create(record.email),
      passwordHash: record.passwordHash,
      createdAt: record.createdAt,
    });
  }
}
