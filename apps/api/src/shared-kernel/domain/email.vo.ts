import { DomainError } from "./domain-error";

export class InvalidEmailError extends DomainError {}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly normalized: string) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailError(`E-mail inválido: ${value}`);
    }
    return new Email(normalized);
  }

  get value(): string {
    return this.normalized;
  }

  equals(other: Email): boolean {
    return this.normalized === other.normalized;
  }
}
