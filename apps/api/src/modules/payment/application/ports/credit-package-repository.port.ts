import { CreditPackage } from "../../domain/credit-package.entity";

export interface CreditPackageRepository {
  findActive(): Promise<CreditPackage[]>;
  findById(id: string): Promise<CreditPackage | null>;
}
