import { Inject, Injectable } from "@nestjs/common";
import { PAYMENT_REPOSITORY } from "../../payment.tokens";
import { PaymentStatus } from "../../domain/payment.entity";
import { PaymentNotFoundError, PaymentNotOwnedByWorkerError } from "../errors";
import { PaymentRepository } from "../ports/payment-repository.port";

export interface PaymentStatusOutput {
  id: string;
  status: PaymentStatus;
  amountCents: number;
  creditsAmount: number;
  expiresAt: Date;
  confirmedAt: Date | null;
}

@Injectable()
export class GetPaymentStatusUseCase {
  constructor(@Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository) {}

  async execute(workerId: string, paymentId: string): Promise<PaymentStatusOutput> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new PaymentNotFoundError(`Pagamento não encontrado: ${paymentId}`);
    }
    if (payment.workerId !== workerId) {
      throw new PaymentNotOwnedByWorkerError("Este pagamento não pertence ao trabalhador autenticado");
    }

    return {
      id: payment.id,
      status: payment.status,
      amountCents: payment.amount.valueInCents,
      creditsAmount: payment.creditsAmount.value,
      expiresAt: payment.expiresAt,
      confirmedAt: payment.confirmedAt,
    };
  }
}
