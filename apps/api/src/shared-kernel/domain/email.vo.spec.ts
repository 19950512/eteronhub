import { Email, InvalidEmailError } from "./email.vo";

describe("Email", () => {
  it("aceita um e-mail válido", () => {
    const email = Email.create("Contato@EteronHub.com");
    expect(email.value).toBe("contato@eteronhub.com");
  });

  it("remove espaços em branco nas bordas", () => {
    const email = Email.create("  contato@eteronhub.com  ");
    expect(email.value).toBe("contato@eteronhub.com");
  });

  it("rejeita um e-mail sem @", () => {
    expect(() => Email.create("contato-eteronhub.com")).toThrow(InvalidEmailError);
  });

  it("rejeita um e-mail sem domínio", () => {
    expect(() => Email.create("contato@eteronhub")).toThrow(InvalidEmailError);
  });

  it("considera iguais dois e-mails com capitalização diferente", () => {
    const a = Email.create("Contato@EteronHub.com");
    const b = Email.create("contato@eteronhub.com");
    expect(a.equals(b)).toBe(true);
  });
});
