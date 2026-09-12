import { Cpf, InvalidCpfError } from "./cpf.vo";

describe("Cpf", () => {
  it("aceita um CPF válido formatado", () => {
    const cpf = Cpf.create("529.982.247-25");
    expect(cpf.value).toBe("52998224725");
  });

  it("aceita um CPF válido apenas com dígitos", () => {
    expect(() => Cpf.create("52998224725")).not.toThrow();
  });

  it("formata o CPF", () => {
    const cpf = Cpf.create("52998224725");
    expect(cpf.format()).toBe("529.982.247-25");
  });

  it("rejeita um dígito verificador inválido", () => {
    expect(() => Cpf.create("529.982.247-26")).toThrow(InvalidCpfError);
  });

  it("rejeita todos os dígitos iguais", () => {
    expect(() => Cpf.create("11111111111")).toThrow(InvalidCpfError);
  });

  it("rejeita tamanho incorreto", () => {
    expect(() => Cpf.create("123")).toThrow(InvalidCpfError);
  });

  it("considera iguais dois CPFs com o mesmo valor", () => {
    const a = Cpf.create("52998224725");
    const b = Cpf.create("529.982.247-25");
    expect(a.equals(b)).toBe(true);
  });
});
