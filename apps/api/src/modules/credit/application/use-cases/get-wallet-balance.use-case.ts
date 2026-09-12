import { Inject, Injectable } from "@nestjs/common";
import { CREDIT_WALLET_REPOSITORY } from "../../credit.tokens";
import { CreditWalletRepository } from "../ports/credit-wallet-repository.port";

export interface WalletBalanceOutput {
  balance: number;
  updatedAt: Date;
}

@Injectable()
export class GetWalletBalanceUseCase {
  constructor(@Inject(CREDIT_WALLET_REPOSITORY) private readonly creditWalletRepository: CreditWalletRepository) {}

  async execute(workerId: string): Promise<WalletBalanceOutput> {
    const wallet = await this.creditWalletRepository.getOrCreateForWorker(workerId);
    return { balance: wallet.balance.value, updatedAt: wallet.updatedAt };
  }
}
