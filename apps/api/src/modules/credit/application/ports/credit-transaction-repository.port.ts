import { CreditTransaction } from "../../domain/credit-transaction.entity";

export interface CreditTransactionRepository {
  save(transaction: CreditTransaction): Promise<void>;
  findByWallet(walletId: string): Promise<CreditTransaction[]>;
}
