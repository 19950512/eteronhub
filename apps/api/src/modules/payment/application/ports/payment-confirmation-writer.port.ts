import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";

export interface ConfirmAndCreditInput {
  paymentId: string;
  workerId: string;
  creditsAmount: CreditAmount;
  e2eId: string | null;
  confirmedAt: Date;
}

/**
 * invariant: marcar o pagamento como CONFIRMED, somar os créditos na carteira e
 * registrar a CreditTransaction acontecem juntos ou nenhum acontece — e, para
 * um mesmo pagamento, no máximo uma vez, mesmo com webhook e reconciliação
 * concorrentes (regra 17). Retorna `true` só para quem efetivamente creditou.
 */
export interface PaymentConfirmationWriter {
  confirmAndCredit(input: ConfirmAndCreditInput): Promise<boolean>;
}
