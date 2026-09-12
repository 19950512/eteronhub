import { SetMetadata } from "@nestjs/common";
import { Role } from "../shared-kernel/application/auth-token-service.port";

export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]): ReturnType<typeof SetMetadata> => SetMetadata(ROLES_KEY, roles);
