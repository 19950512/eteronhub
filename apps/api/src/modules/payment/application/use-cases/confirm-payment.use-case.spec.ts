import { AddCreditsUseCase } from "../../../credit/application/use-cases/add-credits.use-case";
import { CreditTransactionRepository } from "../../../credit/application/ports/credit-transaction-repository.port";
import { CreditWalletRepository } from "../../../credit/application/ports/credit-wallet-repository.port";
import { CreditTransaction } from "../../../credit/domain/credit-transaction.entity";
import { CreditWallet } from "../../../credit/domain/credit-wallet.entity";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { Money } from "../../../../shared-kernel/domain/money.vo";
import { Payment } from "../../domain/payment.entity";
import { PaymentRepository } from "../ports/payment-repository.port";
import { ConfirmPaymentUseCase } from "./confirm-payment.use-case";

class InMemoryPaymentRepository implements PaymentRepository {
  private payments: Payment[] = [];

  async save(payment: Payment): Promise<void> {
    this.payments = this.payments.filter((p) => p.id !== payment.id);
    this.payments.push(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.payments.find((p) => p.id === id) ?? null;
  }

  async findByPixTxId(pixTxId: string): Promise<Payment | null> {
    return this.payments.find((p) => p.pixTxId === pixTxId) ?? null;
  }

  async findPendingExpiredBefore(now: Date): Promise<Payment[]> {
    return this.payments.filter((p) => p.status === "PENDING" && p.expiresAt <= now);
  }

  async findPendingOlderThan(threshold: Date): Promise<Payment[]> {
    return this.payments.filter((p) => p.status === "PENDING" && p.createdAt <= threshold);
  }
}

class InMemoryCreditWalletRepository implements CreditWalletRepository {
  private wallets: CreditWallet[] = [];

  async save(wallet: CreditWallet): Promise<void> {
    this.wallets = this.wallets.filter((w) => w.id !== wallet.id);
    this.wallets.push(wallet);
  }

  async findByWorkerId(workerId: string): Promise<CreditWallet | null> {
    return this.wallets.find((w) => w.workerId === workerId) ?? null;
  }

  async getOrCreateForWorker(workerId: string): Promise<CreditWallet> {
    const existing = await this.findByWorkerId(workerId);
    if (existing) return existing;
    const created = CreditWallet.openFor(workerId);
    await this.save(created);
    return created;
  }
}

class InMemoryCreditTransactionRepository implements CreditTransactionRepository {
  transactions: CreditTransaction[] = [];

  async save(transaction: CreditTransaction): Promise<void> {
    this.transactions.push(transaction);
  }

  async findByWallet(walletId: string): Promise<CreditTransaction[]> {
    return this.transactions.filter((t) => t.walletId === walletId);
  }
}

describe("ConfirmPaymentUseCase", () => {
  function setup() {
    const paymentRepository = new InMemoryPaymentRepository();
    const creditWalletRepository = new InMemoryCreditWalletRepository();
    const creditTransactionRepository = new InMemoryCreditTransactionRepository();
    const addCreditsUseCase = new AddCreditsUseCase(creditWalletRepository, creditTransactionRepository);
    const confirmPaymentUseCase = new ConfirmPaymentUseCase(paymentRepository, addCreditsUseCase);
    return { paymentRepository, creditWalletRepository, creditTransactionRepository, confirmPaymentUseCase };
  }

  it("credita a carteira do trabalhador ao confirmar o pagamento", async () => {
    const { paymentRepository, creditWalletRepository, confirmPaymentUseCase } = setup();

    const payment = Payment.create({
      workerId: "worker-1",
      creditPackageId: "package-1",
      amount: Money.fromCents(2000),
      creditsAmount: CreditAmount.of(20),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await paymentRepository.save(payment);

    await confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId, e2eId: "e2e-1" });

    const wallet = await creditWalletRepository.findByWorkerId("worker-1");
    expect(wallet?.balance.value).toBe(20);
  });

  it("não credita duas vezes ao receber o mesmo webhook duplicado (regra 17)", async () => {
    const { paymentRepository, creditWalletRepository, creditTransactionRepository, confirmPaymentUseCase } = setup();

    const payment = Payment.create({
      workerId: "worker-1",
      creditPackageId: "package-1",
      amount: Money.fromCents(2000),
      creditsAmount: CreditAmount.of(20),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await paymentRepository.save(payment);

    await confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId, e2eId: "e2e-1" });
    await confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId, e2eId: "e2e-1" });
    await confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId, e2eId: "e2e-1" });

    const wallet = await creditWalletRepository.findByWorkerId("worker-1");
    expect(wallet?.balance.value).toBe(20);
    expect(creditTransactionRepository.transactions).toHaveLength(1);
  });

  it("ignora silenciosamente um pixTxId desconhecido", async () => {
    const { confirmPaymentUseCase } = setup();
    await expect(confirmPaymentUseCase.execute({ pixTxId: "txid-inexistente" })).resolves.toBeUndefined();
  });
});
