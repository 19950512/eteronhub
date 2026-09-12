import { InvalidPasswordError, Password } from "./password.vo";

describe("Password", () => {
  it("aceita uma senha com 8 ou mais caracteres", () => {
    expect(() => Password.create("senha123")).not.toThrow();
  });

  it("rejeita uma senha com menos de 8 caracteres", () => {
    expect(() => Password.create("curta")).toThrow(InvalidPasswordError);
  });
});
