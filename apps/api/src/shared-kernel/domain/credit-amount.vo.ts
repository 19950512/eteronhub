import { DomainError } from "./domain-error";

export class InvalidCreditAmountError extends DomainError {}

export class CreditAmount {
  private constructor(private readonly amount: number) {}

  static of(amount: number): CreditAmount {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new InvalidCreditAmountError(`Quantidade de créditos inválida: ${amount}`);
    }
    return new CreditAmount(amount);
  }

  static zero(): CreditAmount {
    return new CreditAmount(0);
  }

  get value(): number {
    return this.amount;
  }

  add(other: CreditAmount): CreditAmount {
    return new CreditAmount(this.amount + other.amount);
  }

  subtract(other: CreditAmount): CreditAmount {
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new InvalidCreditAmountError("Subtração resultaria em saldo de créditos negativo");
    }
    return new CreditAmount(result);
  }

  isGreaterThanOrEqual(other: CreditAmount): boolean {
    return this.amount >= other.amount;
  }

  equals(other: CreditAmount): boolean {
    return this.amount === other.amount;
  }
}
