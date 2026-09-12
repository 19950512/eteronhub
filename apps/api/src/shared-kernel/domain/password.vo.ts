import { ValidationError } from "./domain-error";

export class InvalidPasswordError extends ValidationError {}

const MIN_LENGTH = 8;

export class Password {
  private constructor(private readonly plainText: string) {}

  static create(value: string): Password {
    if (value.length < MIN_LENGTH) {
      throw new InvalidPasswordError(`A senha deve ter pelo menos ${MIN_LENGTH} caracteres`);
    }
    return new Password(value);
  }

  get value(): string {
    return this.plainText;
  }
}
