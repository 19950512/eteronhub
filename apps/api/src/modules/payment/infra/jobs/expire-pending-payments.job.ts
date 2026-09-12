import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ExpirePendingPaymentsUseCase } from "../../application/use-cases/expire-pending-payments.use-case";

@Injectable()
export class ExpirePendingPaymentsJob {
  constructor(private readonly expirePendingPaymentsUseCase: ExpirePendingPaymentsUseCase) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async run(): Promise<void> {
    await this.expirePendingPaymentsUseCase.execute();
  }
}
