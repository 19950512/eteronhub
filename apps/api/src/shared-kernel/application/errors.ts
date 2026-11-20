import { ForbiddenError, UnauthorizedError } from "../domain/domain-error";

export class AccountSuspendedError extends ForbiddenError {
  constructor() {
    super("Conta suspensa. Entre em contato com o suporte.");
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("E-mail ou senha inválidos");
  }
}
