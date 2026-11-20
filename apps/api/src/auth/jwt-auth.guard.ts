import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { AccountStatusReader } from "../shared-kernel/application/account-status-reader.port";
import { AuthTokenPayload } from "../shared-kernel/application/auth-token-service.port";
import { ACCOUNT_STATUS_READER } from "../shared-kernel/tokens";

export type AuthenticatedRequest = Request & { user?: AuthTokenPayload };

export function extractBearerToken(request: Request): string | undefined {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length);
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(ACCOUNT_STATUS_READER)
    private readonly accountStatusReader: AccountStatusReader,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException("Token de autenticação ausente");
    }

    let payload: AuthTokenPayload;
    try {
      payload = this.jwtService.verify<AuthTokenPayload>(token);
    } catch {
      throw new UnauthorizedException("Token de autenticação inválido");
    }

    // why: o JWT vale 1 dia e não é revogável; sem reconsultar o status, uma
    // conta suspensa pelo admin continuaria operando (comprando créditos,
    // desbloqueando contatos, publicando vagas) até o token expirar.
    if (!(await this.accountStatusReader.isActive(payload.role, payload.subject))) {
      throw new UnauthorizedException("Conta suspensa ou inexistente");
    }

    request.user = payload;
    return true;
  }
}
