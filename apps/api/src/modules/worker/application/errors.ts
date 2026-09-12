import { ConflictError, NotFoundError } from "../../../shared-kernel/domain/domain-error";

export class CpfAlreadyRegisteredError extends ConflictError {}
export class WorkerEmailAlreadyRegisteredError extends ConflictError {}
export class WorkerNotFoundError extends NotFoundError {}
