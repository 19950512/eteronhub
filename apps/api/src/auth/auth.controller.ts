import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AUTH_THROTTLE } from "../infra/http/rate-limits";
import { AuthenticateCompanyUseCase } from "../modules/company/application/use-cases/authenticate-company.use-case";
import { AuthenticateWorkerUseCase } from "../modules/worker/application/use-cases/authenticate-worker.use-case";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authenticateCompanyUseCase: AuthenticateCompanyUseCase,
    private readonly authenticateWorkerUseCase: AuthenticateWorkerUseCase,
  ) {}

  @Throttle(AUTH_THROTTLE)
  @Post("login")
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    if (dto.role === "COMPANY") {
      return this.authenticateCompanyUseCase.execute(dto);
    }
    return this.authenticateWorkerUseCase.execute(dto);
  }
}
