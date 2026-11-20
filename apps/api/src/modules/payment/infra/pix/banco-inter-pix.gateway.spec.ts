import { parseBrlAmountToCents } from "./banco-inter-pix.gateway";

describe("parseBrlAmountToCents", () => {
  it.each([
    ["20.00", 2000],
    ["0.01", 1],
    ["35", 3500],
    ["75.5", 7550],
    ["0.10", 10],
  ])("converte %s em %i centavos sem erro de ponto flutuante", (value, cents) => {
    expect(parseBrlAmountToCents(value)).toBe(cents);
  });

  it.each(["", "abc", "-1.00", "1.234", "1,00"])(
    "rejeita o formato inesperado %p",
    (value) => {
      expect(() => parseBrlAmountToCents(value)).toThrow();
    },
  );
});
