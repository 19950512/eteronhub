import {
  ConsentEntry,
  ConsentLog,
} from "../../../../shared-kernel/application/consent-log.port";
import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Cnpj } from "../../../../shared-kernel/domain/cnpj.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import {
  LegalConsentRequiredError,
  TERMS_OF_USE_VERSION,
} from "../../../../shared-kernel/domain/legal-consent.vo";
import { Company } from "../../domain/company.entity";
import { CnpjAlreadyRegisteredError, EmailAlreadyRegisteredError } from "../errors";
import { CompanyRepository } from "../ports/company-repository.port";
import { RegisterCompanyUseCase } from "./register-company.use-case";

class InMemoryCompanyRepository implements CompanyRepository {
  private companies: Company[] = [];

  async save(company: Company): Promise<void> {
    this.companies = this.companies.filter((c) => c.id !== company.id);
    this.companies.push(company);
  }

  async findById(id: string): Promise<Company | null> {
    return this.companies.find((c) => c.id === id) ?? null;
  }

  async findByCnpj(cnpj: Cnpj): Promise<Company | null> {
    return this.companies.find((c) => c.cnpj.equals(cnpj)) ?? null;
  }

  async findByEmail(email: Email): Promise<Company | null> {
    return this.companies.find((c) => c.email.equals(email)) ?? null;
  }

  async existsByCnpj(cnpj: Cnpj): Promise<boolean> {
    return this.companies.some((c) => c.cnpj.equals(cnpj));
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return this.companies.some((c) => c.email.equals(email));
  }
}

class InMemoryConsentLog implements ConsentLog {
  readonly entries: ConsentEntry[] = [];

  async append(entry: ConsentEntry): Promise<void> {
    this.entries.push(entry);
  }
}

class FakePasswordHasher implements PasswordHasher {
  async hash(plainText: string): Promise<string> {
    return `hashed:${plainText}`;
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plainText}`;
  }
}

describe("RegisterCompanyUseCase", () => {
  const validInput = {
    cnpj: "11.222.333/0001-81",
    razaoSocial: "Empresa Teste LTDA",
    email: "contato@empresa-teste.com",
    password: "senha-segura",
    consent: { acceptTerms: true, acceptPrivacyPolicy: true, confirmAdult: true },
    context: { ipAddress: "203.0.113.7", userAgent: "jest" },
  };

  it("registra uma empresa com dados válidos", async () => {
    const repository = new InMemoryCompanyRepository();
    const useCase = new RegisterCompanyUseCase(
      repository,
      new FakePasswordHasher(),
      new InMemoryConsentLog(),
    );

    const result = await useCase.execute(validInput);

    const saved = await repository.findById(result.companyId);
    expect(saved).not.toBeNull();
    expect(saved?.cnpj.value).toBe("11222333000181");
    expect(saved?.status).toBe("ACTIVE");
  });

  it("rejeita duas empresas com o mesmo CNPJ (regra 1)", async () => {
    const repository = new InMemoryCompanyRepository();
    const useCase = new RegisterCompanyUseCase(
      repository,
      new FakePasswordHasher(),
      new InMemoryConsentLog(),
    );

    await useCase.execute(validInput);

    await expect(
      useCase.execute({ ...validInput, email: "outro-email@empresa-teste.com" }),
    ).rejects.toThrow(CnpjAlreadyRegisteredError);
  });

  it("rejeita duas empresas com o mesmo e-mail", async () => {
    const repository = new InMemoryCompanyRepository();
    const useCase = new RegisterCompanyUseCase(
      repository,
      new FakePasswordHasher(),
      new InMemoryConsentLog(),
    );

    await useCase.execute(validInput);

    await expect(
      useCase.execute({ ...validInput, cnpj: "42.033.469/0001-77" }),
    ).rejects.toThrow(EmailAlreadyRegisteredError);
  });

  it("grava o aceite dos Termos e da Política com a versão vigente", async () => {
    const repository = new InMemoryCompanyRepository();
    const consentLog = new InMemoryConsentLog();
    const useCase = new RegisterCompanyUseCase(
      repository,
      new FakePasswordHasher(),
      consentLog,
    );

    const result = await useCase.execute(validInput);

    expect(consentLog.entries).toHaveLength(1);
    expect(consentLog.entries[0]).toMatchObject({
      subjectRole: "COMPANY",
      subjectId: result.companyId,
      consent: { termsVersion: TERMS_OF_USE_VERSION },
      context: { ipAddress: "203.0.113.7" },
    });
  });

  it("não cria a conta sem o aceite dos Termos", async () => {
    const repository = new InMemoryCompanyRepository();
    const consentLog = new InMemoryConsentLog();
    const useCase = new RegisterCompanyUseCase(
      repository,
      new FakePasswordHasher(),
      consentLog,
    );

    await expect(
      useCase.execute({
        ...validInput,
        consent: { ...validInput.consent, acceptTerms: false },
      }),
    ).rejects.toThrow(LegalConsentRequiredError);
    expect(await repository.existsByEmail(Email.create(validInput.email))).toBe(false);
    expect(consentLog.entries).toHaveLength(0);
  });

  it("não cria a conta sem a declaração de maioridade", async () => {
    const repository = new InMemoryCompanyRepository();
    const useCase = new RegisterCompanyUseCase(
      repository,
      new FakePasswordHasher(),
      new InMemoryConsentLog(),
    );

    await expect(
      useCase.execute({
        ...validInput,
        consent: { ...validInput.consent, confirmAdult: false },
      }),
    ).rejects.toThrow("maiores de 18 anos");
  });
});
