import { InvalidWebsiteError, Website } from "./website.vo";

describe("Website", () => {
  it("assume https quando o esquema é omitido", () => {
    expect(Website.create("empresa.com.br").value).toBe("https://empresa.com.br");
  });

  it("mantém o endereço com http ou https", () => {
    expect(Website.create("http://empresa.com.br/sobre").value).toBe(
      "http://empresa.com.br/sobre",
    );
  });

  it("rejeita esquemas diferentes de http/https", () => {
    expect(() => Website.create("javascript://empresa.com.br")).toThrow(
      InvalidWebsiteError,
    );
  });

  it("rejeita endereço sem domínio", () => {
    expect(() => Website.create("empresa")).toThrow(InvalidWebsiteError);
  });
});
