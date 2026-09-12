import { Controller, Get, Param, Query } from "@nestjs/common";
import { GetPublicJobPostingDetailsUseCase } from "./application/use-cases/get-public-job-posting-details.use-case";
import { ListPublicJobPostingsUseCase } from "./application/use-cases/list-public-job-postings.use-case";
import { JobPostingPublicView } from "./domain/job-posting.entity";

@Controller("job-postings")
export class JobPostingPublicController {
  constructor(
    private readonly listPublicJobPostingsUseCase: ListPublicJobPostingsUseCase,
    private readonly getPublicJobPostingDetailsUseCase: GetPublicJobPostingDetailsUseCase,
  ) {}

  @Get()
  async list(@Query("location") location?: string): Promise<JobPostingPublicView[]> {
    return this.listPublicJobPostingsUseCase.execute(location ? { location } : undefined);
  }

  @Get(":id")
  async detail(@Param("id") id: string): Promise<JobPostingPublicView> {
    return this.getPublicJobPostingDetailsUseCase.execute(id);
  }
}
