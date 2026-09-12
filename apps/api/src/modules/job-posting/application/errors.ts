import { ForbiddenError, NotFoundError } from "../../../shared-kernel/domain/domain-error";

export class JobPostingNotFoundError extends NotFoundError {}
export class JobPostingNotOwnedByCompanyError extends ForbiddenError {}
