export type Role = "COMPANY" | "WORKER" | "ADMIN";

export interface AuthTokenPayload {
  subject: string;
  role: Role;
}

export interface AuthTokenService {
  sign(payload: AuthTokenPayload): string;
}
