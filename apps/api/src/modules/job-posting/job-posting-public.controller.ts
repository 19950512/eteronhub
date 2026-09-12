import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../auth/current-user.decorator";
import { OptionalJwtAuthGuard } from "../../auth/optional-jwt-auth.guard";
import { AuthTokenPayload } from "../../shared-kernel/application/auth-token-service.port";
import { GetJobPostingDetailsForWorkerUseCase } from "../job-unlock/application/use-cases/get-job-posting-details-for-worker.use-case";
import { GetPublicJobPostingDetailsUseCase } from "./application/use-cases/get-public-job-posting-details.use-case";
import { ListPublicJobPostingsUseCase } from "./application/use-cases/list-public-job-postings.use-case";
import { JobPostingPublicView, JobPostingUnlockedView } from "./domain/job-posting.entity";

@Controller("job-postings")
export class JobPostingPublicController {
  constructor(
    private readonly listPublicJobPostingsUseCase: ListPublicJobPostingsUseCase,
    private readonly getPublicJobPostingDetailsUseCase: GetPublicJobPostingDetailsUseCase,
    private readonly getJobPostingDetailsForWorkerUseCase: GetJobPostingDetailsForWorkerUseCase,
  ) {}

  @Get()
  async list(@Query("location") location?: string): Promise<JobPostingPublicView[]> {
    return this.listPublicJobPostingsUseCase.execute(location ? { location } : undefined);
  }

  // OptionalJwtAuthGuard não bloqueia acesso anônimo — só anexa o usuário se
  // um token válido de trabalhador estiver presente, para decidir entre a
  // visão anonimizada e a visão desbloqueada (documento 3, seção 5).
  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  async detail(
    @Param("id") id: string,
    @CurrentUser() user?: AuthTokenPayload,
  ): Promise<JobPostingPublicView | JobPostingUnlockedView> {
    if (user?.role === "WORKER") {
      return this.getJobPostingDetailsForWorkerUseCase.execute(user.subject, id);
    }
    return this.getPublicJobPostingDetailsUseCase.execute(id);
  }
}
