import { InvalidBrazilianStateError } from "../../../../shared-kernel/domain/brazilian-state.vo";
import { Cnpj } from "../../../../shared-kernel/domain/cnpj.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { Company, InvalidCompanyProfileError } from "../../domain/company.entity";
import { InvalidCompanySectorError } from "../../domain/company-sector";
import { CompanyNotFoundError } from "../errors";
import { CompanyRepository } from "../ports/company-repository.port";
import { GetCompanyProfileUseCase } from "./get-company-profile.use-case";
import { UpdateCompanyProfileUseCase } from "./update-company-profile.use-case";

class SingleCompanyRepository implements CompanyRepository {
  saved = 0;
  constructor(private company: Company | null) {}
  async save(company: Company): Promise<void> {
    this.company = company;
    this.saved += 1;
  }
  async findById(id: string): Promise<Company | null> {
    return this.company?.id === id ? this.company : null;
  }
  async findByCnpj(): Promise<Company | null> {
    return null;
  }
  async findByEmail(): Promise<Company | null> {
    return null;
  }
  async existsByCnpj(): Promise<boolean> {
    return false;
  }
  async existsByEmail(): Promise<boolean> {
    return false;
  }
}

function newCompany(): Company {
  return Company.register({
    cnpj: Cnpj.create("11222333000181"),
    razaoSocial: "Metalúrgica Ferreira LTDA",
    email: Email.create("contato@ferreira.com.br"),
    passwordHash: "hash",
  });
}

describe("UpdateCompanyProfileUseCase", () => {
  it("atualiza o perfil e devolve a visão da própria empresa", async () => {
    const company = newCompany();
    const repository = new SingleCompanyRepository(company);

    const view = await new UpdateCompanyProfileUseCase(repository).execute(company.id, {
      nomeFantasia: " Ferro & Cia ",
      sector: "ESTRUTURA_METALICA",
      city: " São  Paulo ",
      state: "sp",
      whatsapp: "+55 (11) 90000-0002",
      website: "ferroecia.com.br",
    });

    expect(view).toMatchObject({
      cnpj: "11.222.333/0001-81",
      razaoSocial: "Metalúrgica Ferreira LTDA",
      nomeFantasia: "Ferro & Cia",
      sector: "ESTRUTURA_METALICA",
      city: "São Paulo",
      state: "SP",
      whatsapp: "11900000002",
      website: "https://ferroecia.com.br",
    });
    expect(repository.saved).toBe(1);
    expect(await new GetCompanyProfileUseCase(repository).execute(company.id)).toEqual(
      view,
    );
  });

  it("limpa os campos que não forem enviados", async () => {
    const company = newCompany();
    const repository = new SingleCompanyRepository(company);
    const useCase = new UpdateCompanyProfileUseCase(repository);
    await useCase.execute(company.id, {
      nomeFantasia: "Ferro",
      city: "Recife",
      state: "PE",
      website: "a.com",
    });

    const view = await useCase.execute(company.id, { city: "", state: "" });

    expect(view).toMatchObject({
      nomeFantasia: null,
      sector: null,
      city: null,
      state: null,
      whatsapp: null,
      website: null,
    });
  });

  it("exige cidade e UF juntas", async () => {
    const company = newCompany();
    await expect(
      new UpdateCompanyProfileUseCase(new SingleCompanyRepository(company)).execute(
        company.id,
        { city: "Recife" },
      ),
    ).rejects.toThrow(InvalidCompanyProfileError);
  });

  it("rejeita UF inválida", async () => {
    const company = newCompany();
    await expect(
      new UpdateCompanyProfileUseCase(new SingleCompanyRepository(company)).execute(
        company.id,
        {
          city: "Recife",
          state: "XX",
        },
      ),
    ).rejects.toThrow(InvalidBrazilianStateError);
  });

  it("rejeita setor desconhecido", async () => {
    const company = newCompany();
    await expect(
      new UpdateCompanyProfileUseCase(new SingleCompanyRepository(company)).execute(
        company.id,
        {
          sector: "PADARIA",
        },
      ),
    ).rejects.toThrow(InvalidCompanySectorError);
  });

  it("rejeita nome fantasia com 1 caractere", async () => {
    const company = newCompany();
    await expect(
      new UpdateCompanyProfileUseCase(new SingleCompanyRepository(company)).execute(
        company.id,
        {
          nomeFantasia: "F",
        },
      ),
    ).rejects.toThrow(InvalidCompanyProfileError);
  });

  it("falha quando a empresa não existe", async () => {
    await expect(
      new UpdateCompanyProfileUseCase(new SingleCompanyRepository(null)).execute(
        "inexistente",
        {},
      ),
    ).rejects.toThrow(CompanyNotFoundError);
  });
});
