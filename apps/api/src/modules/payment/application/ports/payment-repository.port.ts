import { Payment } from "../../domain/payment.entity";

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  /**
   * invariant: só grava EXPIRED se o pagamento ainda está PENDING no banco —
   * nunca sobrescreve uma confirmação concorrente. Retorna se expirou.
   */
  markExpiredIfPending(payment: Payment): Promise<boolean>;
  findById(id: string): Promise<Payment | null>;
  findByPixTxId(pixTxId: string): Promise<Payment | null>;
  findPendingExpiredBefore(now: Date): Promise<Payment[]>;
  findPendingOlderThan(threshold: Date): Promise<Payment[]>;
  findExpiredSince(since: Date): Promise<Payment[]>;
}
