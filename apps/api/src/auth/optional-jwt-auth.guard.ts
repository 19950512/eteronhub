import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthTokenPayload } from "../shared-kernel/application/auth-token-service.port";
import { AuthenticatedRequest } from "./jwt-auth.guard";

// Ao contrário de JwtAuthGuard, nunca bloqueia a requisição: só tenta anexar
// `request.user` quando um Bearer token válido está presente. Usado em
// rotas públicas cujo comportamento varia se o chamador está autenticado
// (ex.: detalhe de vaga anonimizado vs. desbloqueado).
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      try {
        request.user = this.jwtService.verify<AuthTokenPayload>(header.slice("Bearer ".length));
      } catch {
        // Token presente mas inválido: segue como acesso anônimo.
      }
    }
    return true;
  }
}
