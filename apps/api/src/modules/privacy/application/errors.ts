import {
  NotFoundError,
  ValidationError,
} from "../../../shared-kernel/domain/domain-error";

export class AccountNotFoundError extends NotFoundError {
  constructor() {
    super("Conta não encontrada");
  }
}

// why: 400 e não 401 — a sessão é válida; só a senha de confirmação está errada,
// e o front não deve tratar isso como sessão expirada.
export class DeletionPasswordMismatchError extends ValidationError {
  constructor() {
    super("Senha incorreta. Confirme a senha atual para excluir a conta.");
  }
}
