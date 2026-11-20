import { CreditAmount } from "../../../../../shared-kernel/domain/credit-amount.vo";
import { Money } from "../../../../../shared-kernel/domain/money.vo";
import { Payment, PaymentProps } from "../../../domain/payment.entity";
import {
  ConfirmAndCreditInput,
  PaymentConfirmationWriter,
} from "../../ports/payment-confirmation-writer.port";
import { PaymentRepository } from "../../ports/payment-repository.port";
import {
  PixChargeDetails,
  PixPaymentGateway,
} from "../../ports/pix-payment-gateway.port";
import { ConfirmPaymentUseCase } from "../confirm-payment.use-case";

function clonePayment(payment: Payment, overrides: Partial<PaymentProps> = {}): Payment {
  return Payment.restore({
    id: payment.id,
    workerId: payment.workerId,
    creditPackageId: payment.creditPackageId,
    amount: payment.amount,
    creditsAmount: payment.creditsAmount,
    status: payment.status,
    pixTxId: payment.pixTxId,
    pixE2eId: payment.pixE2eId,
    createdAt: payment.createdAt,
    expiresAt: payment.expiresAt,
    confirmedAt: payment.confirmedAt,
    ...overrides,
  });
}

// invariant: guarda cópias, como um banco faria — mutar a entidade carregada
// não altera o que está "persistido" até um save/markExpiredIfPending.
export class InMemoryPaymentRepository implements PaymentRepository {
  private payments: Payment[] = [];

  async save(payment: Payment): Promise<void> {
    this.payments = this.payments.filter((p) => p.id !== payment.id);
    this.payments.push(clonePayment(payment));
  }

  async markExpiredIfPending(payment: Payment): Promise<boolean> {
    const stored = this.payments.find((p) => p.id === payment.id);
    if (!stored || stored.status !== "PENDING") return false;
    await this.save(clonePayment(stored, { status: "EXPIRED" }));
    return true;
  }

  async findById(id: string): Promise<Payment | null> {
    const found = this.payments.find((p) => p.id === id);
    return found ? clonePayment(found) : null;
  }

  async findByPixTxId(pixTxId: string): Promise<Payment | null> {
    const found = this.payments.find((p) => p.pixTxId === pixTxId);
    return found ? clonePayment(found) : null;
  }

  async findPendingExpiredBefore(now: Date): Promise<Payment[]> {
    return this.payments
      .filter((p) => p.status === "PENDING" && p.expiresAt <= now)
      .map((p) => clonePayment(p));
  }

  async findExpiredSince(since: Date): Promise<Payment[]> {
    return this.payments
      .filter((p) => p.status === "EXPIRED" && p.expiresAt >= since)
      .map((p) => clonePayment(p));
  }

  async findPendingOlderThan(threshold: Date): Promise<Payment[]> {
    return this.payments
      .filter((p) => p.status === "PENDING" && p.createdAt <= threshold)
      .map((p) => clonePayment(p));
  }
}

export class FakePixPaymentGateway implements PixPaymentGateway {
  private charges = new Map<string, PixChargeDetails | Error>();

  setCharge(pixTxId: string, details: PixChargeDetails | Error): void {
    this.charges.set(pixTxId, details);
  }

  async createCharge(): Promise<never> {
    throw new Error("não usado nestes testes");
  }

  async getCharge(pixTxId: string): Promise<PixChargeDetails> {
    const charge = this.charges.get(pixTxId);
    if (!charge) return { status: "ATIVA", amount: Money.zero(), e2eId: null };
    if (charge instanceof Error) throw charge;
    return charge;
  }
}

export class InMemoryPaymentConfirmationWriter implements PaymentConfirmationWriter {
  readonly balances = new Map<string, number>();
  readonly creditedPaymentIds: string[] = [];

  constructor(private readonly paymentRepository: InMemoryPaymentRepository) {}

  async confirmAndCredit(input: ConfirmAndCreditInput): Promise<boolean> {
    const payment = await this.paymentRepository.findById(input.paymentId);
    if (!payment || payment.status === "CONFIRMED") return false;
    await this.paymentRepository.save(
      clonePayment(payment, {
        status: "CONFIRMED",
        pixE2eId: input.e2eId,
        confirmedAt: input.confirmedAt,
      }),
    );
    this.creditedPaymentIds.push(input.paymentId);
    this.balances.set(
      input.workerId,
      (this.balances.get(input.workerId) ?? 0) + input.creditsAmount.value,
    );
    return true;
  }
}

export function createPayment(
  overrides: { expiresInMs?: number; createdMsAgo?: number } = {},
): Payment {
  const payment = Payment.create({
    workerId: "worker-1",
    creditPackageId: "package-1",
    amount: Money.fromCents(2000),
    creditsAmount: CreditAmount.of(20),
    expiresAt: new Date(Date.now() + (overrides.expiresInMs ?? 60_000)),
  });
  if (overrides.createdMsAgo === undefined) return payment;
  return clonePayment(payment, {
    createdAt: new Date(Date.now() - overrides.createdMsAgo),
  });
}

export function paidCharge(amountInCents = 2000): PixChargeDetails {
  return {
    status: "CONCLUIDA",
    amount: Money.fromCents(amountInCents),
    e2eId: "E2E-DO-PSP",
  };
}

export function setupPaymentFlow() {
  const paymentRepository = new InMemoryPaymentRepository();
  const gateway = new FakePixPaymentGateway();
  const writer = new InMemoryPaymentConfirmationWriter(paymentRepository);
  const confirmPaymentUseCase = new ConfirmPaymentUseCase(
    paymentRepository,
    gateway,
    writer,
  );
  return { paymentRepository, gateway, writer, confirmPaymentUseCase };
}
