import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";

const WEBHOOK_SECRET_HEADER = "x-webhook-secret";

/**
 * Defesa em profundidade para o webhook do Pix: se BANCO_INTER_WEBHOOK_SECRET
 * estiver configurado (recomendado em produção — ver docs/05-operacao-e-lancamento.md),
 * exige que o valor venha em um header combinado previamente com o Banco
 * Inter (ou com o proxy/API gateway na frente da API, se o segredo em si não
 * puder ser configurado do lado do Inter). Sem a env var configurada, não
 * bloqueia nada — evita quebrar o webhook em dev/sandbox por esquecimento
 * de configuração.
 */
@Injectable()
export class WebhookSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expectedSecret = process.env.BANCO_INTER_WEBHOOK_SECRET;
    if (!expectedSecret) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const providedSecret = request.headers[WEBHOOK_SECRET_HEADER];
    if (providedSecret !== expectedSecret) {
      throw new UnauthorizedException("Segredo do webhook inválido ou ausente");
    }
    return true;
  }
}
