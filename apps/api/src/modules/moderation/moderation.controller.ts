import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { JobPostingInternalView } from "../job-posting/domain/job-posting.entity";
import { ApproveJobPostingUseCase } from "./application/use-cases/approve-job-posting.use-case";
import { ListPendingModerationUseCase } from "./application/use-cases/list-pending-moderation.use-case";
import { RejectJobPostingUseCase } from "./application/use-cases/reject-job-posting.use-case";
import { RejectJobPostingDto } from "./dto/reject-job-posting.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/moderation")
export class ModerationController {
  constructor(
    private readonly listPendingModerationUseCase: ListPendingModerationUseCase,
    private readonly approveJobPostingUseCase: ApproveJobPostingUseCase,
    private readonly rejectJobPostingUseCase: RejectJobPostingUseCase,
  ) {}

  @Get("pending")
  async pending(): Promise<JobPostingInternalView[]> {
    return this.listPendingModerationUseCase.execute();
  }

  @Post(":jobPostingId/approve")
  @HttpCode(HttpStatus.NO_CONTENT)
  async approve(@CurrentUser() user: AuthTokenPayload, @Param("jobPostingId") jobPostingId: string): Promise<void> {
    await this.approveJobPostingUseCase.execute(jobPostingId, user.subject);
  }

  @Post(":jobPostingId/reject")
  @HttpCode(HttpStatus.NO_CONTENT)
  async reject(
    @CurrentUser() user: AuthTokenPayload,
    @Param("jobPostingId") jobPostingId: string,
    @Body() dto: RejectJobPostingDto,
  ): Promise<void> {
    await this.rejectJobPostingUseCase.execute(jobPostingId, user.subject, dto.reason);
  }
}
