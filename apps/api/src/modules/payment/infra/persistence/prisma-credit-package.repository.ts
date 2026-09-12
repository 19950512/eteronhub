import { Injectable } from "@nestjs/common";
import type { CreditPackage as CreditPackageRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { Money } from "../../../../shared-kernel/domain/money.vo";
import { CreditPackageRepository } from "../../application/ports/credit-package-repository.port";
import { CreditPackage } from "../../domain/credit-package.entity";

@Injectable()
export class PrismaCreditPackageRepository implements CreditPackageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<CreditPackage[]> {
    const records = await this.prisma.creditPackage.findMany({
      where: { active: true },
      orderBy: { priceCents: "asc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<CreditPackage | null> {
    const record = await this.prisma.creditPackage.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: CreditPackageRecord): CreditPackage {
    return CreditPackage.restore({
      id: record.id,
      name: record.name,
      price: Money.fromCents(record.priceCents),
      creditsAmount: CreditAmount.of(record.creditsAmount),
      active: record.active,
    });
  }
}
