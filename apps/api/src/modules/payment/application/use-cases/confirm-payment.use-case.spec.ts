import {
  createPayment,
  paidCharge,
  setupPaymentFlow,
} from "./testing/payment-test-doubles";

describe("ConfirmPaymentUseCase", () => {
  it("credita a carteira do trabalhador ao confirmar o pagamento", async () => {
    const { paymentRepository, gateway, writer, confirmPaymentUseCase } =
      setupPaymentFlow();
    const payment = createPayment();
    await paymentRepository.save(payment);
    gateway.setCharge(payment.pixTxId, paidCharge());

    await expect(
      confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId }),
    ).resolves.toBe("CONFIRMED");

    expect(writer.balances.get("worker-1")).toBe(20);
    const stored = await paymentRepository.findById(payment.id);
    expect(stored?.status).toBe("CONFIRMED");
    expect(stored?.pixE2eId).toBe("E2E-DO-PSP");
  });

  it("não credita duas vezes ao receber o mesmo webhook duplicado (regra 17)", async () => {
    const { paymentRepository, gateway, writer, confirmPaymentUseCase } =
      setupPaymentFlow();
    const payment = createPayment();
    await paymentRepository.save(payment);
    gateway.setCharge(payment.pixTxId, paidCharge());

    await confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId });
    await confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId });
    await confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId });

    expect(writer.balances.get("worker-1")).toBe(20);
    expect(writer.creditedPaymentIds).toHaveLength(1);
  });

  it("ignora silenciosamente um pixTxId desconhecido", async () => {
    const { confirmPaymentUseCase } = setupPaymentFlow();
    await expect(
      confirmPaymentUseCase.execute({ pixTxId: "txid-inexistente" }),
    ).resolves.toBe("UNKNOWN_PAYMENT");
  });

  it("não credita um webhook forjado para uma cobrança que o PSP diz não estar paga", async () => {
    const { paymentRepository, gateway, writer, confirmPaymentUseCase } =
      setupPaymentFlow();
    const payment = createPayment();
    await paymentRepository.save(payment);
    gateway.setCharge(payment.pixTxId, { ...paidCharge(), status: "ATIVA" });

    await expect(
      confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId }),
    ).resolves.toBe("NOT_PAID");

    expect(writer.balances.get("worker-1")).toBeUndefined();
    expect((await paymentRepository.findById(payment.id))?.status).toBe("PENDING");
  });

  it("não credita quando o valor pago no PSP difere do valor da cobrança", async () => {
    const { paymentRepository, gateway, writer, confirmPaymentUseCase } =
      setupPaymentFlow();
    const payment = createPayment();
    await paymentRepository.save(payment);
    gateway.setCharge(payment.pixTxId, paidCharge(1));

    await expect(
      confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId }),
    ).resolves.toBe("AMOUNT_MISMATCH");

    expect(writer.balances.get("worker-1")).toBeUndefined();
  });

  it("credita um pagamento já expirado localmente quando o PSP confirma que foi pago (RN-19)", async () => {
    const { paymentRepository, gateway, writer, confirmPaymentUseCase } =
      setupPaymentFlow();
    const payment = createPayment({ expiresInMs: -1 });
    payment.expire();
    await paymentRepository.save(payment);
    gateway.setCharge(payment.pixTxId, paidCharge());

    await expect(
      confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId }),
    ).resolves.toBe("CONFIRMED");

    expect(writer.balances.get("worker-1")).toBe(20);
  });

  it("propaga a falha do PSP para que o webhook seja reentregue", async () => {
    const { paymentRepository, gateway, confirmPaymentUseCase } = setupPaymentFlow();
    const payment = createPayment();
    await paymentRepository.save(payment);
    gateway.setCharge(payment.pixTxId, new Error("Inter fora do ar"));

    await expect(
      confirmPaymentUseCase.execute({ pixTxId: payment.pixTxId }),
    ).rejects.toThrow("Inter fora do ar");
  });
});
