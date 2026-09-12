import { ValidationError } from "../../../shared-kernel/domain/domain-error";
import { Money } from "../../../shared-kernel/domain/money.vo";

export class InvalidSalaryRangeError extends ValidationError {}

export class SalaryRange {
  private constructor(
    private readonly min: Money,
    private readonly max: Money,
  ) {}

  static create(minCents: number, maxCents: number): SalaryRange {
    const min = Money.fromCents(minCents);
    const max = Money.fromCents(maxCents);
    if (!max.isGreaterThanOrEqual(min)) {
      throw new InvalidSalaryRangeError("O salário máximo deve ser maior ou igual ao mínimo");
    }
    return new SalaryRange(min, max);
  }

  get minValue(): Money {
    return this.min;
  }

  get maxValue(): Money {
    return this.max;
  }
}
