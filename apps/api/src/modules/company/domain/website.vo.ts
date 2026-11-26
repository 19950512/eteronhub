import { ValidationError } from "../../../shared-kernel/domain/domain-error";

export class InvalidWebsiteError extends ValidationError {}

const MAX_LENGTH = 200;

export class Website {
  private constructor(private readonly url: string) {}

  static create(value: string): Website {
    const trimmed = value.trim();
    // why: empresas costumam digitar só "empresa.com.br"; assumir https evita
    // rejeitar um endereço válido por falta do esquema.
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    if (withScheme.length > MAX_LENGTH) {
      throw new InvalidWebsiteError(`Site deve ter no máximo ${MAX_LENGTH} caracteres`);
    }

    let parsed: URL;
    try {
      parsed = new URL(withScheme);
    } catch {
      throw new InvalidWebsiteError(`Site inválido: ${value}`);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new InvalidWebsiteError("Site deve começar com http:// ou https://");
    }
    if (!parsed.hostname.includes(".")) {
      throw new InvalidWebsiteError(`Site inválido: ${value}`);
    }
    return new Website(withScheme);
  }

  get value(): string {
    return this.url;
  }
}
