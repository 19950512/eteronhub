import { BrazilianState, InvalidBrazilianStateError } from "./brazilian-state.vo";

describe("BrazilianState", () => {
  it("normaliza a UF para maiúsculas", () => {
    expect(BrazilianState.create(" sp ").value).toBe("SP");
  });

  it("rejeita UF inexistente", () => {
    expect(() => BrazilianState.create("XX")).toThrow(InvalidBrazilianStateError);
  });
});
