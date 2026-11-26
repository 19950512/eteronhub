import { Body, Controller, Headers, Ip, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AUTH_THROTTLE } from "../../infra/http/rate-limits";
import { RegisterWorkerUseCase } from "./application/use-cases/register-worker.use-case";
import { RegisterWorkerDto } from "./dto/register-worker.dto";

@Controller("workers")
export class WorkerController {
  constructor(private readonly registerWorkerUseCase: RegisterWorkerUseCase) {}

  @Throttle(AUTH_THROTTLE)
  @Post()
  async register(
    @Body() dto: RegisterWorkerDto,
    @Ip() ipAddress: string | undefined,
    @Headers("user-agent") userAgent: string | undefined,
  ): Promise<{ id: string }> {
    const { acceptTerms, acceptPrivacyPolicy, confirmAdult, ...account } = dto;
    const { workerId } = await this.registerWorkerUseCase.execute({
      ...account,
      consent: { acceptTerms, acceptPrivacyPolicy, confirmAdult },
      context: { ipAddress: ipAddress ?? null, userAgent: userAgent ?? null },
    });
    return { id: workerId };
  }
}
