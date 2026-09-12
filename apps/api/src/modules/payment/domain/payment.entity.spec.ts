import { CreditAmount } from "../../../shared-kernel/domain/credit-amount.vo";
import { Money } from "../../../shared-kernel/domain/money.vo";
import { InvalidPaymentStateError, Payment } from "./payment.entity";

function createPendingPayment(expiresInMs = 60_000): Payment {
  return Payment.create({
    workerId: "worker-1",
    creditPackageId: "package-1",
    amount: Money.fromCents(2000),
    creditsAmount: CreditAmount.of(20),
    expiresAt: new Date(Date.now() + expiresInMs),
  });
}

describe("Payment", () => {
  it("gera um pixTxId igual ao id, sem hífens", () => {
    const payment = createPendingPayment();
    expect(payment.pixTxId).toBe(payment.id);
    expect(payment.id).not.toContain("-");
  });

  it("confirma um pagamento pendente", () => {
    const payment = createPendingPayment();
    const changed = payment.confirm("e2e-1");
    expect(changed).toBe(true);
    expect(payment.status).toBe("CONFIRMED");
    expect(payment.pixE2eId).toBe("e2e-1");
  });

  it("uma segunda confirmação é um no-op idempotente (regra 17)", () => {
    const payment = createPendingPayment();
    payment.confirm("e2e-1");
    const changedAgain = payment.confirm("e2e-1-duplicado");
    expect(changedAgain).toBe(false);
    expect(payment.status).toBe("CONFIRMED");
    expect(payment.pixE2eId).toBe("e2e-1");
  });

  it("expira apenas após a data de expiração", () => {
    const payment = createPendingPayment(-1);
    payment.expire();
    expect(payment.status).toBe("EXPIRED");
  });

  it("não expira antes da data de expiração", () => {
    const payment = createPendingPayment(60_000);
    expect(() => payment.expire()).toThrow(InvalidPaymentStateError);
  });

  it("não confirma um pagamento já expirado", () => {
    const payment = createPendingPayment(-1);
    payment.expire();
    expect(() => payment.confirm("e2e-1")).toThrow(InvalidPaymentStateError);
  });
});
