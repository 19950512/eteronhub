import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AUTH_THROTTLE } from "../../infra/http/rate-limits";
import { RegisterWorkerUseCase } from "./application/use-cases/register-worker.use-case";
import { RegisterWorkerDto } from "./dto/register-worker.dto";

@Controller("workers")
export class WorkerController {
  constructor(private readonly registerWorkerUseCase: RegisterWorkerUseCase) {}

  @Throttle(AUTH_THROTTLE)
  @Post()
  async register(@Body() dto: RegisterWorkerDto): Promise<{ id: string }> {
    const { workerId } = await this.registerWorkerUseCase.execute(dto);
    return { id: workerId };
  }
}
