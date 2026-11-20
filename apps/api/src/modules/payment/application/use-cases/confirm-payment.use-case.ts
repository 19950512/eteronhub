import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  PAYMENT_CONFIRMATION_WRITER,
  PAYMENT_REPOSITORY,
  PIX_PAYMENT_GATEWAY,
} from "../../payment.tokens";
import { PaymentConfirmationWriter } from "../ports/payment-confirmation-writer.port";
import { PaymentRepository } from "../ports/payment-repository.port";
import { PixPaymentGateway } from "../ports/pix-payment-gateway.port";

export interface ConfirmPaymentInput {
  pixTxId: string;
}

export type ConfirmPaymentOutcome =
  "CONFIRMED" | "ALREADY_CONFIRMED" | "NOT_PAID" | "AMOUNT_MISMATCH" | "UNKNOWN_PAYMENT";

@Injectable()
export class ConfirmPaymentUseCase {
  private readonly logger = new Logger(ConfirmPaymentUseCase.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository,
    @Inject(PIX_PAYMENT_GATEWAY) private readonly pixPaymentGateway: PixPaymentGateway,
    @Inject(PAYMENT_CONFIRMATION_WRITER)
    private readonly confirmationWriter: PaymentConfirmationWriter,
  ) {}

  // invariant: o crédito só é liberado depois que o PSP confirma, na própria
  // API dele, que a cobrança foi paga no valor esperado. O webhook é apenas um
  // gatilho — seu conteúdo não é confiável (o txid é o paymentId, que o
  // próprio trabalhador conhece).
  async execute(input: ConfirmPaymentInput): Promise<ConfirmPaymentOutcome> {
    const payment = await this.paymentRepository.findByPixTxId(input.pixTxId);
    if (!payment) {
      this.logger.warn(
        `Recebida confirmação para um pixTxId desconhecido: ${input.pixTxId}`,
      );
      return "UNKNOWN_PAYMENT";
    }
    if (payment.status === "CONFIRMED") {
      return "ALREADY_CONFIRMED";
    }

    const charge = await this.pixPaymentGateway.getCharge(payment.pixTxId);
    if (charge.status !== "CONCLUIDA") {
      return "NOT_PAID";
    }
    if (!charge.amount.equals(payment.amount)) {
      // why: alvo de alerta — exige investigação manual; creditar ou expirar
      // automaticamente aqui poderia dar crédito indevido ou esconder dinheiro recebido.
      this.logger.error(
        `Pagamento ${payment.id} CONCLUIDA no PSP com valor ${charge.amount.valueInCents} centavos, esperado ${payment.amount.valueInCents} — crédito NÃO liberado`,
      );
      return "AMOUNT_MISMATCH";
    }

    const confirmedAt = new Date();
    payment.confirm(charge.e2eId, confirmedAt);

    const credited = await this.confirmationWriter.confirmAndCredit({
      paymentId: payment.id,
      workerId: payment.workerId,
      creditsAmount: payment.creditsAmount,
      e2eId: charge.e2eId,
      confirmedAt,
    });
    if (!credited) {
      return "ALREADY_CONFIRMED";
    }

    this.logger.log(
      `Pagamento ${payment.id} confirmado: ${payment.creditsAmount.value} créditos para o trabalhador ${payment.workerId}`,
    );
    return "CONFIRMED";
  }
}
