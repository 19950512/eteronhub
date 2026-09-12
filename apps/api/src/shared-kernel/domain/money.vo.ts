import { ValidationError } from "./domain-error";

export class InvalidMoneyError extends ValidationError {}

export class Money {
  private constructor(private readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new InvalidMoneyError(`Valor monetário inválido: ${cents}`);
    }
    return new Money(cents);
  }

  static zero(): Money {
    return new Money(0);
  }

  get valueInCents(): number {
    return this.cents;
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    const result = this.cents - other.cents;
    if (result < 0) {
      throw new InvalidMoneyError("Subtração resultaria em valor monetário negativo");
    }
    return new Money(result);
  }

  isGreaterThanOrEqual(other: Money): boolean {
    return this.cents >= other.cents;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  formatBRL(): string {
    return (this.cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
}
