import { Inject, Injectable, Logger } from "@nestjs/common";
import { AddCreditsUseCase } from "../../../credit/application/use-cases/add-credits.use-case";
import { PAYMENT_REPOSITORY } from "../../payment.tokens";
import { PaymentRepository } from "../ports/payment-repository.port";

export interface ConfirmPaymentInput {
  pixTxId: string;
  e2eId?: string | null;
}

@Injectable()
export class ConfirmPaymentUseCase {
  private readonly logger = new Logger(ConfirmPaymentUseCase.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository,
    private readonly addCreditsUseCase: AddCreditsUseCase,
  ) {}

  // Ignora silenciosamente txids que não correspondem a um pagamento
  // conhecido — o webhook do Banco Inter pode notificar eventos que não são
  // nossos, e o job de reconciliação só chama isto para txids que já são
  // nossos (ver docs/03-arquitetura-tecnica.md, seção 4.3).
  async execute(input: ConfirmPaymentInput): Promise<void> {
    const payment = await this.paymentRepository.findByPixTxId(input.pixTxId);
    if (!payment) {
      this.logger.warn(`Recebida confirmação para um pixTxId desconhecido: ${input.pixTxId}`);
      return;
    }

    const wasNewlyConfirmed = payment.confirm(input.e2eId ?? null);
    await this.paymentRepository.save(payment);

    if (wasNewlyConfirmed) {
      await this.addCreditsUseCase.execute({
        workerId: payment.workerId,
        amount: payment.creditsAmount,
        relatedPaymentId: payment.id,
      });
    }
  }
}
