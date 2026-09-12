import { InvalidSalaryRangeError, SalaryRange } from "./salary-range.vo";

describe("SalaryRange", () => {
  it("aceita uma faixa válida", () => {
    const range = SalaryRange.create(300000, 500000);
    expect(range.minValue.valueInCents).toBe(300000);
    expect(range.maxValue.valueInCents).toBe(500000);
  });

  it("aceita mínimo igual ao máximo", () => {
    expect(() => SalaryRange.create(300000, 300000)).not.toThrow();
  });

  it("rejeita máximo menor que o mínimo", () => {
    expect(() => SalaryRange.create(500000, 300000)).toThrow(InvalidSalaryRangeError);
  });
});
