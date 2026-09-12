import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ExpireJobPostingsUseCase } from "../../application/use-cases/expire-job-postings.use-case";

@Injectable()
export class ExpireJobPostingsJob {
  constructor(private readonly expireJobPostingsUseCase: ExpireJobPostingsUseCase) {}

  @Cron(CronExpression.EVERY_HOUR)
  async run(): Promise<void> {
    await this.expireJobPostingsUseCase.execute();
  }
}
