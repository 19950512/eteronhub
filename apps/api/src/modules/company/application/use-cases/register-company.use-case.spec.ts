import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Cnpj } from "../../../../shared-kernel/domain/cnpj.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
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
  };

  it("registra uma empresa com dados válidos", async () => {
    const repository = new InMemoryCompanyRepository();
    const useCase = new RegisterCompanyUseCase(repository, new FakePasswordHasher());

    const result = await useCase.execute(validInput);

    const saved = await repository.findById(result.companyId);
    expect(saved).not.toBeNull();
    expect(saved?.cnpj.value).toBe("11222333000181");
    expect(saved?.status).toBe("ACTIVE");
  });

  it("rejeita duas empresas com o mesmo CNPJ (regra 1)", async () => {
    const repository = new InMemoryCompanyRepository();
    const useCase = new RegisterCompanyUseCase(repository, new FakePasswordHasher());

    await useCase.execute(validInput);

    await expect(
      useCase.execute({ ...validInput, email: "outro-email@empresa-teste.com" }),
    ).rejects.toThrow(CnpjAlreadyRegisteredError);
  });

  it("rejeita duas empresas com o mesmo e-mail", async () => {
    const repository = new InMemoryCompanyRepository();
    const useCase = new RegisterCompanyUseCase(repository, new FakePasswordHasher());

    await useCase.execute(validInput);

    await expect(useCase.execute({ ...validInput, cnpj: "42.033.469/0001-77" })).rejects.toThrow(
      EmailAlreadyRegisteredError,
    );
  });
});
