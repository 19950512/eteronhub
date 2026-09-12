export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

// Subclasses agrupam erros de domínio por natureza, para que a Infra/Container
// (ex.: um exception filter HTTP) possa mapear para um status sem precisar
// conhecer cada erro concreto individualmente.
export abstract class ValidationError extends DomainError {}
export abstract class ConflictError extends DomainError {}
export abstract class NotFoundError extends DomainError {}
export abstract class UnauthorizedError extends DomainError {}
export abstract class ForbiddenError extends DomainError {}
