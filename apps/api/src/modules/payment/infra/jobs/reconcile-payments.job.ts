import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { JobLeaseService } from "../../../../infra/scheduling/job-lease.service";
import { ReconcilePaymentsUseCase } from "../../application/use-cases/reconcile-payments.use-case";

const LEASE_MS = 4 * 60 * 1000;

@Injectable()
export class ReconcilePaymentsJob {
  private readonly logger = new Logger(ReconcilePaymentsJob.name);

  constructor(
    private readonly reconcilePaymentsUseCase: ReconcilePaymentsUseCase,
    private readonly jobLease: JobLeaseService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async run(): Promise<void> {
    try {
      await this.jobLease.runExclusive("reconcile-payments", LEASE_MS, () =>
        this.reconcilePaymentsUseCase.execute(),
      );
    } catch (error) {
      // Falha na reconciliação (ex.: Banco Inter fora do ar) não deve
      // derrubar o processo agendado — a próxima execução tenta de novo.
      this.logger.error(
        "Falha ao reconciliar pagamentos pendentes com o Banco Inter",
        error as Error,
      );
    }
  }
}
