import { CreditAmount } from "../../../shared-kernel/domain/credit-amount.vo";
import { CreditWallet, InsufficientCreditsError } from "./credit-wallet.entity";

describe("CreditWallet", () => {
  it("começa com saldo zero", () => {
    const wallet = CreditWallet.openFor("worker-1");
    expect(wallet.balance.value).toBe(0);
  });

  it("credita créditos ao saldo", () => {
    const wallet = CreditWallet.openFor("worker-1");
    wallet.credit(CreditAmount.of(10));
    expect(wallet.balance.value).toBe(10);
  });

  it("debita créditos do saldo quando há saldo suficiente", () => {
    const wallet = CreditWallet.openFor("worker-1");
    wallet.credit(CreditAmount.of(10));
    wallet.debit(CreditAmount.of(4));
    expect(wallet.balance.value).toBe(6);
  });

  it("nunca deixa o saldo negativo (regra 20)", () => {
    const wallet = CreditWallet.openFor("worker-1");
    wallet.credit(CreditAmount.of(5));
    expect(() => wallet.debit(CreditAmount.of(10))).toThrow(InsufficientCreditsError);
    expect(wallet.balance.value).toBe(5);
  });
});
