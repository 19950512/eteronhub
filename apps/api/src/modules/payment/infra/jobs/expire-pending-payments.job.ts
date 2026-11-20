import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { JobLeaseService } from "../../../../infra/scheduling/job-lease.service";
import { ExpirePendingPaymentsUseCase } from "../../application/use-cases/expire-pending-payments.use-case";

const LEASE_MS = 8 * 60 * 1000;

@Injectable()
export class ExpirePendingPaymentsJob {
  private readonly logger = new Logger(ExpirePendingPaymentsJob.name);

  constructor(
    private readonly expirePendingPaymentsUseCase: ExpirePendingPaymentsUseCase,
    private readonly jobLease: JobLeaseService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async run(): Promise<void> {
    try {
      await this.jobLease.runExclusive("expire-pending-payments", LEASE_MS, () =>
        this.expirePendingPaymentsUseCase.execute(),
      );
    } catch (error) {
      this.logger.error("Falha ao expirar cobranças Pix pendentes", error as Error);
    }
  }
}
