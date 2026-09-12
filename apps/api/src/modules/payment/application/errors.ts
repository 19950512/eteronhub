import { ForbiddenError, NotFoundError } from "../../../shared-kernel/domain/domain-error";

export class PaymentNotFoundError extends NotFoundError {}
export class PaymentNotOwnedByWorkerError extends ForbiddenError {}
export class CreditPackageNotFoundError extends NotFoundError {}
