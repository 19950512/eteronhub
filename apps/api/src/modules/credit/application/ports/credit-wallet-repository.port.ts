import { CreditWallet } from "../../domain/credit-wallet.entity";

export interface CreditWalletRepository {
  save(wallet: CreditWallet): Promise<void>;
  findByWorkerId(workerId: string): Promise<CreditWallet | null>;
  getOrCreateForWorker(workerId: string): Promise<CreditWallet>;
}
