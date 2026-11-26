import { ValidationError } from "./domain-error";

export class InvalidPhoneNumberError extends ValidationError {}

const COUNTRY_CODE = "55";
// invariant: DDD não começa com 0 e o número local tem 8 (fixo) ou 9 (celular) dígitos.
const NATIONAL_NUMBER_REGEX = /^[1-9][1-9]\d{8,9}$/;

export class PhoneNumber {
  private constructor(private readonly digits: string) {}

  static create(value: string): PhoneNumber {
    let digits = value.replace(/\D/g, "");
    // why: aceita o número colado com DDI (+55), mas persiste sempre no formato
    // nacional para que o mesmo telefone não seja salvo de duas formas.
    if (
      (digits.length === 12 || digits.length === 13) &&
      digits.startsWith(COUNTRY_CODE)
    ) {
      digits = digits.slice(COUNTRY_CODE.length);
    }
    if (!NATIONAL_NUMBER_REGEX.test(digits)) {
      throw new InvalidPhoneNumberError(
        `Telefone inválido: informe DDD e número (${value})`,
      );
    }
    return new PhoneNumber(digits);
  }

  get value(): string {
    return this.digits;
  }

  format(): string {
    return this.digits.length === 11
      ? this.digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
      : this.digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  equals(other: PhoneNumber): boolean {
    return this.digits === other.digits;
  }
}
