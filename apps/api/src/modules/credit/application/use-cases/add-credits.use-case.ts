import { Inject, Injectable } from "@nestjs/common";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { CREDIT_TRANSACTION_REPOSITORY, CREDIT_WALLET_REPOSITORY } from "../../credit.tokens";
import { CreditTransaction } from "../../domain/credit-transaction.entity";
import { CreditTransactionRepository } from "../ports/credit-transaction-repository.port";
import { CreditWalletRepository } from "../ports/credit-wallet-repository.port";

export interface AddCreditsInput {
  workerId: string;
  amount: CreditAmount;
  relatedPaymentId: string;
}

@Injectable()
export class AddCreditsUseCase {
  constructor(
    @Inject(CREDIT_WALLET_REPOSITORY) private readonly creditWalletRepository: CreditWalletRepository,
    @Inject(CREDIT_TRANSACTION_REPOSITORY) private readonly creditTransactionRepository: CreditTransactionRepository,
  ) {}

  async execute(input: AddCreditsInput): Promise<void> {
    const wallet = await this.creditWalletRepository.getOrCreateForWorker(input.workerId);
    wallet.credit(input.amount);
    await this.creditWalletRepository.save(wallet);

    await this.creditTransactionRepository.save(
      CreditTransaction.topUp({
        walletId: wallet.id,
        amount: input.amount,
        relatedPaymentId: input.relatedPaymentId,
      }),
    );
  }
}
