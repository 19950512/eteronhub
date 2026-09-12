import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ReconcilePaymentsUseCase } from "../../application/use-cases/reconcile-payments.use-case";

@Injectable()
export class ReconcilePaymentsJob {
  private readonly logger = new Logger(ReconcilePaymentsJob.name);

  constructor(private readonly reconcilePaymentsUseCase: ReconcilePaymentsUseCase) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async run(): Promise<void> {
    try {
      await this.reconcilePaymentsUseCase.execute();
    } catch (error) {
      // Falha na reconciliação (ex.: Banco Inter fora do ar) não deve
      // derrubar o processo agendado — a próxima execução tenta de novo.
      this.logger.error("Falha ao reconciliar pagamentos pendentes com o Banco Inter", error as Error);
    }
  }
}
