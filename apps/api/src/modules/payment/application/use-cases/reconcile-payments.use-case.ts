import { Inject, Injectable } from "@nestjs/common";
import { PAYMENT_REPOSITORY, PIX_PAYMENT_GATEWAY } from "../../payment.tokens";
import { ConfirmPaymentUseCase } from "./confirm-payment.use-case";
import { PaymentRepository } from "../ports/payment-repository.port";
import { PixPaymentGateway } from "../ports/pix-payment-gateway.port";

const RECONCILIATION_THRESHOLD_MINUTES = 5;

// Cobre o caso de um webhook do Banco Inter perdido: para pagamentos que
// seguem PENDING além do esperado, consulta a cobrança diretamente na API do
// Inter e confirma se ela já foi concluída — ver docs/03-arquitetura-tecnica.md,
// seção 4.4.
@Injectable()
export class ReconcilePaymentsUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository,
    @Inject(PIX_PAYMENT_GATEWAY) private readonly pixPaymentGateway: PixPaymentGateway,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
  ) {}

  async execute(now: Date = new Date()): Promise<void> {
    const threshold = new Date(now.getTime() - RECONCILIATION_THRESHOLD_MINUTES * 60 * 1000);
    const pending = await this.paymentRepository.findPendingOlderThan(threshold);

    for (const payment of pending) {
      const status = await this.pixPaymentGateway.getChargeStatus(payment.pixTxId);
      if (status === "CONCLUIDA") {
        await this.confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId });
      }
    }
  }
}
