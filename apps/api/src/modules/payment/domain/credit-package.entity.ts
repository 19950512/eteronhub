import { CreditAmount } from "../../../shared-kernel/domain/credit-amount.vo";
import { Money } from "../../../shared-kernel/domain/money.vo";

export interface CreditPackageProps {
  id: string;
  name: string;
  price: Money;
  creditsAmount: CreditAmount;
  active: boolean;
}

export class CreditPackage {
  private constructor(private readonly props: CreditPackageProps) {}

  static restore(props: CreditPackageProps): CreditPackage {
    return new CreditPackage(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): Money {
    return this.props.price;
  }

  get creditsAmount(): CreditAmount {
    return this.props.creditsAmount;
  }

  get active(): boolean {
    return this.props.active;
  }
}
