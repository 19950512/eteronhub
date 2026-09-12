import { CreditAmount, InvalidCreditAmountError } from "./credit-amount.vo";

describe("CreditAmount", () => {
  it("cria a partir de um inteiro não-negativo", () => {
    expect(CreditAmount.of(10).value).toBe(10);
  });

  it("aceita zero", () => {
    expect(CreditAmount.zero().value).toBe(0);
  });

  it("rejeita valores negativos", () => {
    expect(() => CreditAmount.of(-1)).toThrow(InvalidCreditAmountError);
  });

  it("rejeita valores não inteiros", () => {
    expect(() => CreditAmount.of(1.5)).toThrow(InvalidCreditAmountError);
  });

  it("soma dois valores", () => {
    const total = CreditAmount.of(10).add(CreditAmount.of(5));
    expect(total.value).toBe(15);
  });

  it("subtrai dois valores", () => {
    const result = CreditAmount.of(10).subtract(CreditAmount.of(4));
    expect(result.value).toBe(6);
  });

  it("lança erro se a subtração resultar em saldo negativo", () => {
    expect(() => CreditAmount.of(3).subtract(CreditAmount.of(5))).toThrow(InvalidCreditAmountError);
  });

  it("compara se um valor é maior ou igual a outro", () => {
    expect(CreditAmount.of(5).isGreaterThanOrEqual(CreditAmount.of(5))).toBe(true);
    expect(CreditAmount.of(4).isGreaterThanOrEqual(CreditAmount.of(5))).toBe(false);
  });
});
