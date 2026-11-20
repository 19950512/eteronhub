import { Inject, Injectable, Logger } from "@nestjs/common";
import { PAYMENT_REPOSITORY } from "../../payment.tokens";
import { PaymentRepository } from "../ports/payment-repository.port";
import { ConfirmPaymentUseCase } from "./confirm-payment.use-case";

@Injectable()
export class ExpirePendingPaymentsUseCase {
  private readonly logger = new Logger(ExpirePendingPaymentsUseCase.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
  ) {}

  // invariant: RN-19 — só expira o que o PSP diz que NÃO foi pago. Uma
  // cobrança paga cujo webhook se perdeu é confirmada aqui em vez de expirar;
  // se o PSP não responde, o pagamento fica PENDING e é reavaliado na próxima rodada.
  async execute(now: Date = new Date()): Promise<void> {
    const candidates = await this.paymentRepository.findPendingExpiredBefore(now);
    for (const payment of candidates) {
      try {
        const outcome = await this.confirmPaymentUseCase.execute({
          pixTxId: payment.pixTxId,
        });
        if (outcome !== "NOT_PAID") {
          continue;
        }
        payment.expire(now);
        await this.paymentRepository.markExpiredIfPending(payment);
      } catch (error) {
        this.logger.error(
          `Falha ao avaliar a expiração do pagamento ${payment.id}`,
          error as Error,
        );
      }
    }
  }
}
