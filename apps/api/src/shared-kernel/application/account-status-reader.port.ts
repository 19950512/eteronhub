import { Role } from "./auth-token-service.port";

export interface AccountStatusReader {
  /** `false` se a conta não existe mais ou está suspensa. */
  isActive(role: Role, subject: string): Promise<boolean>;
}
