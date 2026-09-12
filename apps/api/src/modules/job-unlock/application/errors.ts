import { ConflictError } from "../../../shared-kernel/domain/domain-error";

export class JobPostingNotAvailableForUnlockError extends ConflictError {}
