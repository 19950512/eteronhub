import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import type { Response } from "express";
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../shared-kernel/domain/domain-error";

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.statusFor(exception);
    response.status(status).json({ statusCode: status, error: exception.name, message: exception.message });
  }

  private statusFor(exception: DomainError): number {
    if (exception instanceof ValidationError) return HttpStatus.BAD_REQUEST;
    if (exception instanceof ConflictError) return HttpStatus.CONFLICT;
    if (exception instanceof NotFoundError) return HttpStatus.NOT_FOUND;
    if (exception instanceof UnauthorizedError) return HttpStatus.UNAUTHORIZED;
    if (exception instanceof ForbiddenError) return HttpStatus.FORBIDDEN;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
