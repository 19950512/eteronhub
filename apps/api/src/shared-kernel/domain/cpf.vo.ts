import { ValidationError } from "./domain-error";

export class InvalidCpfError extends ValidationError {}

function calcCheckDigit(digits: string, length: number): number {
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += Number(digits[i]) * (length + 1 - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValid(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  if (calcCheckDigit(digits, 9) !== Number(digits[9])) return false;
  return calcCheckDigit(digits, 10) === Number(digits[10]);
}

export class Cpf {
  private constructor(private readonly digits: string) {}

  static create(value: string): Cpf {
    const digits = value.replace(/\D/g, "");
    if (!isValid(digits)) {
      throw new InvalidCpfError(`CPF inválido: ${value}`);
    }
    return new Cpf(digits);
  }

  get value(): string {
    return this.digits;
  }

  format(): string {
    return this.digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  equals(other: Cpf): boolean {
    return this.digits === other.digits;
  }
}
