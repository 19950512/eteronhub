import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { AuthTokenPayload } from "../shared-kernel/application/auth-token-service.port";

export type AuthenticatedRequest = Request & { user?: AuthTokenPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException("Token de autenticação ausente");
    }

    try {
      request.user = this.jwtService.verify<AuthTokenPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException("Token de autenticação inválido");
    }
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) return undefined;
    return header.slice("Bearer ".length);
  }
}
