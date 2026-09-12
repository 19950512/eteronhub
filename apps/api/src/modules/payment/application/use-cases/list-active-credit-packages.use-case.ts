import { Inject, Injectable } from "@nestjs/common";
import { CREDIT_PACKAGE_REPOSITORY } from "../../payment.tokens";
import { CreditPackageRepository } from "../ports/credit-package-repository.port";

export interface CreditPackageView {
  id: string;
  name: string;
  priceCents: number;
  creditsAmount: number;
}

@Injectable()
export class ListActiveCreditPackagesUseCase {
  constructor(@Inject(CREDIT_PACKAGE_REPOSITORY) private readonly creditPackageRepository: CreditPackageRepository) {}

  async execute(): Promise<CreditPackageView[]> {
    const packages = await this.creditPackageRepository.findActive();
    return packages.map((creditPackage) => ({
      id: creditPackage.id,
      name: creditPackage.name,
      priceCents: creditPackage.price.valueInCents,
      creditsAmount: creditPackage.creditsAmount.value,
    }));
  }
}
