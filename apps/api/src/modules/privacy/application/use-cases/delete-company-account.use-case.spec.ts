import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Cnpj } from "../../../../shared-kernel/domain/cnpj.vo";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { CompanyRepository } from "../../../company/application/ports/company-repository.port";
import {
  Company,
  CompanyAccountDeletedError,
} from "../../../company/domain/company.entity";
import { JobPostingRepository } from "../../../job-posting/application/ports/job-posting-repository.port";
import { ContactInfo } from "../../../job-posting/domain/contact-info.vo";
import { JobPosting } from "../../../job-posting/domain/job-posting.entity";
import { SalaryRange } from "../../../job-posting/domain/salary-range.vo";
import { DeletionPasswordMismatchError } from "../errors";
import { DeleteCompanyAccountUseCase } from "./delete-company-account.use-case";

class InMemoryCompanyRepository implements CompanyRepository {
  readonly companies = new Map<string, Company>();

  async save(company: Company): Promise<void> {
    this.companies.set(company.id, company);
  }

  async findById(id: string): Promise<Company | null> {
    return this.companies.get(id) ?? null;
  }

  async findByCnpj(cnpj: Cnpj): Promise<Company | null> {
    return [...this.companies.values()].find((c) => c.cnpj.equals(cnpj)) ?? null;
  }

  async findByEmail(email: Email): Promise<Company | null> {
    return [...this.companies.values()].find((c) => c.email.equals(email)) ?? null;
  }

  async existsByCnpj(cnpj: Cnpj): Promise<boolean> {
    return (await this.findByCnpj(cnpj)) !== null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return (await this.findByEmail(email)) !== null;
  }
}

class InMemoryJobPostingRepository implements JobPostingRepository {
  readonly jobPostings = new Map<string, JobPosting>();
  saves = 0;

  async save(jobPosting: JobPosting): Promise<void> {
    this.saves += 1;
    this.jobPostings.set(jobPosting.id, jobPosting);
  }

  async findById(id: string): Promise<JobPosting | null> {
    return this.jobPostings.get(id) ?? null;
  }

  async findByCompany(companyId: string): Promise<JobPosting[]> {
    return [...this.jobPostings.values()].filter((job) => job.companyId === companyId);
  }

  async findPublished(): Promise<JobPosting[]> {
    return [...this.jobPostings.values()].filter((job) => job.status === "PUBLISHED");
  }

  async findPendingModeration(): Promise<JobPosting[]> {
    return [];
  }

  async findExpiredPublished(): Promise<JobPosting[]> {
    return [];
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

function jobFor(companyId: string): JobPosting {
  return JobPosting.create({
    companyId,
    title: "Soldador MIG",
    description: "Galpão em Betim",
    requirements: "Experiência com MIG",
    salaryRange: SalaryRange.create(300000, 450000),
    location: "Betim, MG",
    contactInfo: ContactInfo.create({ email: "rh@empresa.com" }),
    unlockCost: CreditAmount.of(10),
  });
}

describe("DeleteCompanyAccountUseCase", () => {
  const now = new Date("2026-11-25T12:00:00Z");

  async function setup() {
    const companies = new InMemoryCompanyRepository();
    const jobs = new InMemoryJobPostingRepository();
    const company = Company.register({
      cnpj: Cnpj.create("11.222.333/0001-81"),
      razaoSocial: "Estruturas Teste LTDA",
      nomeFantasia: "Estruturas Teste",
      email: Email.create("contato@estruturas.com"),
      passwordHash: "hashed:senha-segura",
    });
    await companies.save(company);

    const published = jobFor(company.id);
    published.submitForModeration();
    published.approve(new Date("2026-11-01T00:00:00Z"), new Date("2026-12-01T00:00:00Z"));
    const draft = jobFor(company.id);
    const otherCompanyJob = jobFor("outra-empresa");
    otherCompanyJob.submitForModeration();
    otherCompanyJob.approve(
      new Date("2026-11-01T00:00:00Z"),
      new Date("2026-12-01T00:00:00Z"),
    );
    for (const job of [published, draft, otherCompanyJob]) {
      jobs.jobPostings.set(job.id, job);
    }

    const useCase = new DeleteCompanyAccountUseCase(
      companies,
      jobs,
      new FakePasswordHasher(),
    );
    return { companies, jobs, company, published, draft, otherCompanyJob, useCase };
  }

  it("encerra as vagas da empresa e anonimiza a conta, mantendo CNPJ e razão social", async () => {
    const { companies, company, published, draft, otherCompanyJob, useCase } =
      await setup();

    await useCase.execute(company.id, "senha-segura", now);

    expect(published.status).toBe("CLOSED");
    expect(draft.status).toBe("CLOSED");
    expect(otherCompanyJob.status).toBe("PUBLISHED");

    const deleted = await companies.findById(company.id);
    expect(deleted?.status).toBe("DELETED");
    expect(deleted?.deletedAt).toEqual(now);
    expect(deleted?.nomeFantasia).toBeNull();
    expect(deleted?.email.value).not.toContain("estruturas");
    expect(deleted?.razaoSocial).toBe("Estruturas Teste LTDA");
    expect(deleted?.cnpj.value).toBe("11222333000181");
    expect(() => deleted?.suspend()).toThrow(CompanyAccountDeletedError);
  });

  it("não mexe em nada com a senha errada", async () => {
    const { companies, jobs, company, published, useCase } = await setup();

    await expect(useCase.execute(company.id, "errada", now)).rejects.toThrow(
      DeletionPasswordMismatchError,
    );
    expect(published.status).toBe("PUBLISHED");
    expect(jobs.saves).toBe(0);
    expect((await companies.findById(company.id))?.status).toBe("ACTIVE");
  });
});
