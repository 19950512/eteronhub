import { DomainError } from "./domain-error";

export class InvalidCnpjError extends DomainError {}

const FIRST_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_DIGIT_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function calcCheckDigit(base: string, weights: number[]): number {
  const sum = weights.reduce((acc, weight, index) => acc + Number(base[index]) * weight, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValid(digits: string): boolean {
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const digit1 = calcCheckDigit(digits.slice(0, 12), FIRST_DIGIT_WEIGHTS);
  if (digit1 !== Number(digits[12])) return false;

  const digit2 = calcCheckDigit(digits.slice(0, 13), SECOND_DIGIT_WEIGHTS);
  return digit2 === Number(digits[13]);
}

export class Cnpj {
  private constructor(private readonly digits: string) {}

  static create(value: string): Cnpj {
    const digits = value.replace(/\D/g, "");
    if (!isValid(digits)) {
      throw new InvalidCnpjError(`CNPJ inválido: ${value}`);
    }
    return new Cnpj(digits);
  }

  get value(): string {
    return this.digits;
  }

  format(): string {
    return this.digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  equals(other: Cnpj): boolean {
    return this.digits === other.digits;
  }
}
