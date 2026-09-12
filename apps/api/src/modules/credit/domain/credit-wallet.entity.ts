import { randomUUID } from "node:crypto";
import { ConflictError } from "../../../shared-kernel/domain/domain-error";
import { CreditAmount } from "../../../shared-kernel/domain/credit-amount.vo";

export class InsufficientCreditsError extends ConflictError {}

export interface CreditWalletProps {
  id: string;
  workerId: string;
  balance: CreditAmount;
  updatedAt: Date;
}

export class CreditWallet {
  private constructor(private readonly props: CreditWalletProps) {}

  static openFor(workerId: string): CreditWallet {
    return new CreditWallet({
      id: randomUUID(),
      workerId,
      balance: CreditAmount.zero(),
      updatedAt: new Date(),
    });
  }

  static restore(props: CreditWalletProps): CreditWallet {
    return new CreditWallet(props);
  }

  credit(amount: CreditAmount): void {
    this.props.balance = this.props.balance.add(amount);
    this.props.updatedAt = new Date();
  }

  debit(amount: CreditAmount): void {
    if (!this.props.balance.isGreaterThanOrEqual(amount)) {
      throw new InsufficientCreditsError("Saldo de créditos insuficiente");
    }
    this.props.balance = this.props.balance.subtract(amount);
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get workerId(): string {
    return this.props.workerId;
  }

  get balance(): CreditAmount {
    return this.props.balance;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
