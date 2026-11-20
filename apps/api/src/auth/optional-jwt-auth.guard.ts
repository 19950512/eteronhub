import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccountStatusReader } from "../shared-kernel/application/account-status-reader.port";
import { AuthTokenPayload } from "../shared-kernel/application/auth-token-service.port";
import { ACCOUNT_STATUS_READER } from "../shared-kernel/tokens";
import { AuthenticatedRequest, extractBearerToken } from "./jwt-auth.guard";

// Ao contrário de JwtAuthGuard, nunca bloqueia a requisição: só tenta anexar
// `request.user` quando um Bearer token válido está presente. Usado em
// rotas públicas cujo comportamento varia se o chamador está autenticado
// (ex.: detalhe de vaga anonimizado vs. desbloqueado).
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(ACCOUNT_STATUS_READER)
    private readonly accountStatusReader: AccountStatusReader,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    if (!token) {
      return true;
    }

    let payload: AuthTokenPayload;
    try {
      payload = this.jwtService.verify<AuthTokenPayload>(token);
    } catch {
      return true;
    }

    // invariant: conta suspensa é tratada como anônima — nunca recebe a visão
    // desbloqueada (com contato da empresa) só por portar um token ainda válido.
    if (await this.accountStatusReader.isActive(payload.role, payload.subject)) {
      request.user = payload;
    }
    return true;
  }
}
