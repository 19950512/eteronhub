import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { CloseJobPostingUseCase } from "./application/use-cases/close-job-posting.use-case";
import { CreateJobPostingUseCase } from "./application/use-cases/create-job-posting.use-case";
import { ListCompanyJobPostingsUseCase } from "./application/use-cases/list-company-job-postings.use-case";
import { SubmitJobPostingForModerationUseCase } from "./application/use-cases/submit-job-posting-for-moderation.use-case";
import { UpdateJobPostingDraftUseCase } from "./application/use-cases/update-job-posting-draft.use-case";
import { JobPostingInternalView } from "./domain/job-posting.entity";
import { JobPostingDto } from "./dto/job-posting.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("COMPANY")
@Controller("companies/me/job-postings")
export class JobPostingCompanyController {
  constructor(
    private readonly createJobPostingUseCase: CreateJobPostingUseCase,
    private readonly updateJobPostingDraftUseCase: UpdateJobPostingDraftUseCase,
    private readonly submitJobPostingForModerationUseCase: SubmitJobPostingForModerationUseCase,
    private readonly closeJobPostingUseCase: CloseJobPostingUseCase,
    private readonly listCompanyJobPostingsUseCase: ListCompanyJobPostingsUseCase,
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthTokenPayload): Promise<JobPostingInternalView[]> {
    return this.listCompanyJobPostingsUseCase.execute(user.subject);
  }

  @Post()
  async create(@CurrentUser() user: AuthTokenPayload, @Body() dto: JobPostingDto): Promise<{ id: string }> {
    const { jobPostingId } = await this.createJobPostingUseCase.execute({ companyId: user.subject, ...dto });
    return { id: jobPostingId };
  }

  @Patch(":id")
  async update(
    @CurrentUser() user: AuthTokenPayload,
    @Param("id") id: string,
    @Body() dto: JobPostingDto,
  ): Promise<void> {
    await this.updateJobPostingDraftUseCase.execute(user.subject, id, dto);
  }

  @Post(":id/submit")
  @HttpCode(HttpStatus.NO_CONTENT)
  async submit(@CurrentUser() user: AuthTokenPayload, @Param("id") id: string): Promise<void> {
    await this.submitJobPostingForModerationUseCase.execute(user.subject, id);
  }

  @Post(":id/close")
  @HttpCode(HttpStatus.NO_CONTENT)
  async close(@CurrentUser() user: AuthTokenPayload, @Param("id") id: string): Promise<void> {
    await this.closeJobPostingUseCase.execute(user.subject, id);
  }
}
