import { Cnpj, InvalidCnpjError } from "./cnpj.vo";

describe("Cnpj", () => {
  it("aceita um CNPJ válido formatado", () => {
    const cnpj = Cnpj.create("11.222.333/0001-81");
    expect(cnpj.value).toBe("11222333000181");
  });

  it("aceita um CNPJ válido apenas com dígitos", () => {
    expect(() => Cnpj.create("11222333000181")).not.toThrow();
  });

  it("formata o CNPJ", () => {
    const cnpj = Cnpj.create("11222333000181");
    expect(cnpj.format()).toBe("11.222.333/0001-81");
  });

  it("rejeita um dígito verificador inválido", () => {
    expect(() => Cnpj.create("11.222.333/0001-80")).toThrow(InvalidCnpjError);
  });

  it("rejeita todos os dígitos iguais", () => {
    expect(() => Cnpj.create("11111111111111")).toThrow(InvalidCnpjError);
  });

  it("rejeita tamanho incorreto", () => {
    expect(() => Cnpj.create("123")).toThrow(InvalidCnpjError);
  });

  it("considera iguais dois CNPJs com o mesmo valor", () => {
    const a = Cnpj.create("11222333000181");
    const b = Cnpj.create("11.222.333/0001-81");
    expect(a.equals(b)).toBe(true);
  });
});
