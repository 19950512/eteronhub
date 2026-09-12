import { ConflictError, NotFoundError } from "../../../shared-kernel/domain/domain-error";

export class CnpjAlreadyRegisteredError extends ConflictError {}
export class EmailAlreadyRegisteredError extends ConflictError {}
export class CompanyNotFoundError extends NotFoundError {}
