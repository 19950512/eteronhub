import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { JobUnlockHistoryItem, ListWorkerJobUnlocksUseCase } from "./application/use-cases/list-worker-job-unlocks.use-case";
import { UnlockJobPostingOutput, UnlockJobPostingUseCase } from "./application/use-cases/unlock-job-posting.use-case";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("WORKER")
@Controller("workers/me")
export class JobUnlockController {
  constructor(
    private readonly unlockJobPostingUseCase: UnlockJobPostingUseCase,
    private readonly listWorkerJobUnlocksUseCase: ListWorkerJobUnlocksUseCase,
  ) {}

  @Post("job-postings/:id/unlock")
  async unlock(@CurrentUser() user: AuthTokenPayload, @Param("id") id: string): Promise<UnlockJobPostingOutput> {
    return this.unlockJobPostingUseCase.execute(user.subject, id);
  }

  @Get("job-unlocks")
  async history(@CurrentUser() user: AuthTokenPayload): Promise<JobUnlockHistoryItem[]> {
    return this.listWorkerJobUnlocksUseCase.execute(user.subject);
  }
}
