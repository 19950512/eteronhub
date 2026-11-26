import { ValidationError } from "./domain-error";

export class InvalidBrazilianStateError extends ValidationError {}

export const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
] as const;

export type BrazilianStateCode = (typeof BRAZILIAN_STATES)[number];

function isBrazilianStateCode(value: string): value is BrazilianStateCode {
  return (BRAZILIAN_STATES as readonly string[]).includes(value);
}

export class BrazilianState {
  private constructor(private readonly code: BrazilianStateCode) {}

  static create(value: string): BrazilianState {
    const normalized = value.trim().toUpperCase();
    if (!isBrazilianStateCode(normalized)) {
      throw new InvalidBrazilianStateError(`UF inválida: ${value}`);
    }
    return new BrazilianState(normalized);
  }

  get value(): BrazilianStateCode {
    return this.code;
  }

  equals(other: BrazilianState): boolean {
    return this.code === other.code;
  }
}
