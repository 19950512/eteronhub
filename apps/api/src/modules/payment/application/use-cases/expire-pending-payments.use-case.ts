import { Inject, Injectable } from "@nestjs/common";
import { PAYMENT_REPOSITORY } from "../../payment.tokens";
import { PaymentRepository } from "../ports/payment-repository.port";

@Injectable()
export class ExpirePendingPaymentsUseCase {
  constructor(@Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository) {}

  async execute(now: Date = new Date()): Promise<void> {
    const expired = await this.paymentRepository.findPendingExpiredBefore(now);
    for (const payment of expired) {
      payment.expire(now);
      await this.paymentRepository.save(payment);
    }
  }
}
