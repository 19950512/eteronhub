import { ExpirePendingPaymentsUseCase } from "./expire-pending-payments.use-case";
import { ReconcilePaymentsUseCase } from "./reconcile-payments.use-case";
import {
  createPayment,
  paidCharge,
  setupPaymentFlow,
} from "./testing/payment-test-doubles";

describe("ExpirePendingPaymentsUseCase", () => {
  function setup() {
    const flow = setupPaymentFlow();
    const useCase = new ExpirePendingPaymentsUseCase(
      flow.paymentRepository,
      flow.confirmPaymentUseCase,
    );
    return { ...flow, useCase };
  }

  it("expira uma cobrança vencida que o PSP diz não ter sido paga (RN-19)", async () => {
    const { paymentRepository, useCase } = setup();
    const payment = createPayment({ expiresInMs: -1 });
    await paymentRepository.save(payment);

    await useCase.execute();

    expect((await paymentRepository.findById(payment.id))?.status).toBe("EXPIRED");
  });

  it("confirma em vez de expirar uma cobrança vencida que foi paga mas cujo webhook se perdeu", async () => {
    const { paymentRepository, gateway, writer, useCase } = setup();
    const payment = createPayment({ expiresInMs: -1 });
    await paymentRepository.save(payment);
    gateway.setCharge(payment.pixTxId, paidCharge());

    await useCase.execute();

    expect((await paymentRepository.findById(payment.id))?.status).toBe("CONFIRMED");
    expect(writer.balances.get("worker-1")).toBe(20);
  });

  it("não expira quando o PSP está indisponível e segue para os próximos pagamentos", async () => {
    const { paymentRepository, gateway, useCase } = setup();
    const unreachable = createPayment({ expiresInMs: -1 });
    const unpaid = createPayment({ expiresInMs: -1 });
    await paymentRepository.save(unreachable);
    await paymentRepository.save(unpaid);
    gateway.setCharge(unreachable.pixTxId, new Error("timeout"));

    await useCase.execute();

    expect((await paymentRepository.findById(unreachable.id))?.status).toBe("PENDING");
    expect((await paymentRepository.findById(unpaid.id))?.status).toBe("EXPIRED");
  });
});

describe("ReconcilePaymentsUseCase", () => {
  function setup() {
    const flow = setupPaymentFlow();
    const useCase = new ReconcilePaymentsUseCase(
      flow.paymentRepository,
      flow.confirmPaymentUseCase,
    );
    return { ...flow, useCase };
  }

  it("confirma pagamentos pendentes já pagos no PSP e continua mesmo se um deles falhar", async () => {
    const { paymentRepository, gateway, writer, useCase } = setup();
    const failing = createPayment({ createdMsAgo: 10 * 60_000 });
    const paid = createPayment({ createdMsAgo: 10 * 60_000 });
    await paymentRepository.save(failing);
    await paymentRepository.save(paid);
    gateway.setCharge(failing.pixTxId, new Error("timeout"));
    gateway.setCharge(paid.pixTxId, paidCharge());

    await useCase.execute();

    expect((await paymentRepository.findById(paid.id))?.status).toBe("CONFIRMED");
    expect((await paymentRepository.findById(failing.id))?.status).toBe("PENDING");
    expect(writer.balances.get("worker-1")).toBe(20);
  });

  it("credita um pagamento expirado recentemente que o PSP concluiu depois da checagem de expiração", async () => {
    const { paymentRepository, gateway, writer, useCase } = setup();
    const payment = createPayment({ expiresInMs: -60_000 });
    payment.expire();
    await paymentRepository.save(payment);
    gateway.setCharge(payment.pixTxId, paidCharge());

    await useCase.execute();

    expect((await paymentRepository.findById(payment.id))?.status).toBe("CONFIRMED");
    expect(writer.balances.get("worker-1")).toBe(20);
  });

  it("não reverifica expirações antigas, fora da janela de defasagem do PSP", async () => {
    const { paymentRepository, gateway, writer, useCase } = setup();
    const payment = createPayment({ expiresInMs: -2 * 60 * 60_000 });
    payment.expire();
    await paymentRepository.save(payment);
    gateway.setCharge(payment.pixTxId, paidCharge());

    await useCase.execute();

    expect((await paymentRepository.findById(payment.id))?.status).toBe("EXPIRED");
    expect(writer.balances.get("worker-1")).toBeUndefined();
  });
});
