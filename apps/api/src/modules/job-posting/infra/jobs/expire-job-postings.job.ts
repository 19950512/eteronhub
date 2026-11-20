import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { JobLeaseService } from "../../../../infra/scheduling/job-lease.service";
import { ExpireJobPostingsUseCase } from "../../application/use-cases/expire-job-postings.use-case";

const LEASE_MS = 30 * 60 * 1000;

@Injectable()
export class ExpireJobPostingsJob {
  private readonly logger = new Logger(ExpireJobPostingsJob.name);

  constructor(
    private readonly expireJobPostingsUseCase: ExpireJobPostingsUseCase,
    private readonly jobLease: JobLeaseService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async run(): Promise<void> {
    try {
      await this.jobLease.runExclusive("expire-job-postings", LEASE_MS, () =>
        this.expireJobPostingsUseCase.execute(),
      );
    } catch (error) {
      this.logger.error("Falha ao expirar vagas publicadas", error as Error);
    }
  }
}
