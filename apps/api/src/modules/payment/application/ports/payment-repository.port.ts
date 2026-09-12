import { Payment } from "../../domain/payment.entity";

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
  findByPixTxId(pixTxId: string): Promise<Payment | null>;
  findPendingExpiredBefore(now: Date): Promise<Payment[]>;
  findPendingOlderThan(threshold: Date): Promise<Payment[]>;
}
