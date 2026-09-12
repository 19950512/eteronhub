import { ContactInfo, InvalidContactInfoError } from "./contact-info.vo";

describe("ContactInfo", () => {
  it("aceita quando ao menos um meio de contato é informado", () => {
    expect(() => ContactInfo.create({ email: "vagas@empresa.com" })).not.toThrow();
    expect(() => ContactInfo.create({ phone: "11999999999" })).not.toThrow();
    expect(() => ContactInfo.create({ applicationUrl: "https://empresa.com/vagas/1" })).not.toThrow();
  });

  it("rejeita quando nenhum meio de contato é informado", () => {
    expect(() => ContactInfo.create({})).toThrow(InvalidContactInfoError);
  });
});
