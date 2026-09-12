import { UnauthorizedError } from "../domain/domain-error";

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("E-mail ou senha inválidos");
  }
}
