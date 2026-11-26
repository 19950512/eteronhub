import { InvalidPhoneNumberError, PhoneNumber } from "./phone-number.vo";

describe("PhoneNumber", () => {
  it("aceita celular com DDD formatado e guarda só dígitos", () => {
    expect(PhoneNumber.create("(11) 98765-4321").value).toBe("11987654321");
  });

  it("aceita telefone fixo com DDD", () => {
    expect(PhoneNumber.create("1133334444").format()).toBe("(11) 3333-4444");
  });

  it("remove o DDI 55 para guardar no formato nacional", () => {
    expect(PhoneNumber.create("+55 54 98419-2072").value).toBe("54984192072");
  });

  it("formata celular", () => {
    expect(PhoneNumber.create("11987654321").format()).toBe("(11) 98765-4321");
  });

  it("rejeita número sem DDD", () => {
    expect(() => PhoneNumber.create("98765-4321")).toThrow(InvalidPhoneNumberError);
  });

  it("rejeita DDD começando com zero", () => {
    expect(() => PhoneNumber.create("01987654321")).toThrow(InvalidPhoneNumberError);
  });
});
