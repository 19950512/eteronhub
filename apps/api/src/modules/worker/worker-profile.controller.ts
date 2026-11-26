import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { GetWorkerProfileUseCase } from "./application/use-cases/get-worker-profile.use-case";
import { UpdateWorkerProfileUseCase } from "./application/use-cases/update-worker-profile.use-case";
import { WorkerProfileView } from "./domain/worker.entity";
import { UpdateWorkerProfileDto } from "./dto/update-worker-profile.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("WORKER")
@Controller("workers/me/profile")
export class WorkerProfileController {
  constructor(
    private readonly getWorkerProfileUseCase: GetWorkerProfileUseCase,
    private readonly updateWorkerProfileUseCase: UpdateWorkerProfileUseCase,
  ) {}

  @Get()
  async get(@CurrentUser() user: AuthTokenPayload): Promise<WorkerProfileView> {
    return this.getWorkerProfileUseCase.execute(user.subject);
  }

  @Put()
  async update(
    @CurrentUser() user: AuthTokenPayload,
    @Body() dto: UpdateWorkerProfileDto,
  ): Promise<WorkerProfileView> {
    return this.updateWorkerProfileUseCase.execute(user.subject, dto);
  }
}
