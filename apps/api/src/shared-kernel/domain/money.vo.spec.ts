import { Money, InvalidMoneyError } from "./money.vo";

describe("Money", () => {
  it("cria a partir de centavos", () => {
    expect(Money.fromCents(1000).valueInCents).toBe(1000);
  });

  it("rejeita valores negativos", () => {
    expect(() => Money.fromCents(-1)).toThrow(InvalidMoneyError);
  });

  it("rejeita valores não inteiros", () => {
    expect(() => Money.fromCents(10.5)).toThrow(InvalidMoneyError);
  });

  it("soma dois valores", () => {
    const total = Money.fromCents(1000).add(Money.fromCents(500));
    expect(total.valueInCents).toBe(1500);
  });

  it("subtrai dois valores", () => {
    const result = Money.fromCents(1000).subtract(Money.fromCents(300));
    expect(result.valueInCents).toBe(700);
  });

  it("lança erro se a subtração resultar em valor negativo", () => {
    expect(() => Money.fromCents(100).subtract(Money.fromCents(200))).toThrow(InvalidMoneyError);
  });

  it("formata em BRL", () => {
    expect(Money.fromCents(150050).formatBRL()).toBe("R$ 1.500,50");
  });
});
