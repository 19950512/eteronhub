import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { AuthTokenPayload } from "../shared-kernel/application/auth-token-service.port";
import { AuthenticatedRequest } from "./jwt-auth.guard";

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthTokenPayload => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user as AuthTokenPayload;
});
