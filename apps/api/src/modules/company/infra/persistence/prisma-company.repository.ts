import { Injectable } from "@nestjs/common";
import type { Company as CompanyRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { Cnpj } from "../../../../shared-kernel/domain/cnpj.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { CompanyRepository } from "../../application/ports/company-repository.port";
import { Company, CompanyStatus } from "../../domain/company.entity";

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(company: Company): Promise<void> {
    await this.prisma.company.upsert({
      where: { id: company.id },
      create: {
        id: company.id,
        cnpj: company.cnpj.value,
        razaoSocial: company.razaoSocial,
        nomeFantasia: company.nomeFantasia,
        email: company.email.value,
        passwordHash: company.passwordHash,
        status: company.status,
        createdAt: company.createdAt,
      },
      update: {
        razaoSocial: company.razaoSocial,
        nomeFantasia: company.nomeFantasia,
        email: company.email.value,
        passwordHash: company.passwordHash,
        status: company.status,
      },
    });
  }

  async findById(id: string): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByCnpj(cnpj: Cnpj): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({ where: { cnpj: cnpj.value } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({ where: { email: email.value } });
    return record ? this.toDomain(record) : null;
  }

  async existsByCnpj(cnpj: Cnpj): Promise<boolean> {
    const count = await this.prisma.company.count({ where: { cnpj: cnpj.value } });
    return count > 0;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.company.count({ where: { email: email.value } });
    return count > 0;
  }

  private toDomain(record: CompanyRecord): Company {
    return Company.restore({
      id: record.id,
      cnpj: Cnpj.create(record.cnpj),
      razaoSocial: record.razaoSocial,
      nomeFantasia: record.nomeFantasia,
      email: Email.create(record.email),
      passwordHash: record.passwordHash,
      status: record.status as CompanyStatus,
      createdAt: record.createdAt,
    });
  }
}
