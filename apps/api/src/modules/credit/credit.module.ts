import { Module } from "@nestjs/common";
import { AddCreditsUseCase } from "./application/use-cases/add-credits.use-case";
import { GetWalletBalanceUseCase } from "./application/use-cases/get-wallet-balance.use-case";
import { CREDIT_TRANSACTION_REPOSITORY, CREDIT_WALLET_REPOSITORY } from "./credit.tokens";
import { CreditWalletController } from "./credit-wallet.controller";
import { PrismaCreditTransactionRepository } from "./infra/persistence/prisma-credit-transaction.repository";
import { PrismaCreditWalletRepository } from "./infra/persistence/prisma-credit-wallet.repository";

@Module({
  controllers: [CreditWalletController],
  providers: [
    { provide: CREDIT_WALLET_REPOSITORY, useClass: PrismaCreditWalletRepository },
    { provide: CREDIT_TRANSACTION_REPOSITORY, useClass: PrismaCreditTransactionRepository },
    AddCreditsUseCase,
    GetWalletBalanceUseCase,
  ],
  exports: [AddCreditsUseCase, GetWalletBalanceUseCase],
})
export class CreditModule {}
