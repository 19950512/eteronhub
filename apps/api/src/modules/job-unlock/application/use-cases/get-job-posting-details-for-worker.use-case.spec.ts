import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { Cnpj } from "../../../../shared-kernel/domain/cnpj.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { CompanyRepository } from "../../../company/application/ports/company-repository.port";
import { Company } from "../../../company/domain/company.entity";
import {
  JobPostingFilter,
  JobPostingRepository,
} from "../../../job-posting/application/ports/job-posting-repository.port";
import { ContactInfo } from "../../../job-posting/domain/contact-info.vo";
import { JobPosting } from "../../../job-posting/domain/job-posting.entity";
import { SalaryRange } from "../../../job-posting/domain/salary-range.vo";
import { JobUnlock } from "../../domain/job-unlock.entity";
import { JobUnlockRepository } from "../ports/job-unlock-repository.port";
import { GetJobPostingDetailsForWorkerUseCase } from "./get-job-posting-details-for-worker.use-case";

class StubJobPostingRepository implements JobPostingRepository {
  constructor(private readonly jobPosting: JobPosting | null) {}
  async save(): Promise<void> {}
  async findById(): Promise<JobPosting | null> {
    return this.jobPosting;
  }
  async findByCompany(): Promise<JobPosting[]> {
    return [];
  }
  async findPublished(_filter?: JobPostingFilter): Promise<JobPosting[]> {
    return [];
  }
  async findPendingModeration(): Promise<JobPosting[]> {
    return [];
  }
  async findExpiredPublished(): Promise<JobPosting[]> {
    return [];
  }
}

class StubJobUnlockRepository implements JobUnlockRepository {
  constructor(private readonly unlock: JobUnlock | null) {}
  async findByWorkerAndJobPosting(): Promise<JobUnlock | null> {
    return this.unlock;
  }
  async findByWorker(): Promise<JobUnlock[]> {
    return this.unlock ? [this.unlock] : [];
  }
}

class StubCompanyRepository implements CompanyRepository {
  constructor(private readonly company: Company | null) {}
  async save(): Promise<void> {}
  async findById(): Promise<Company | null> {
    return this.company;
  }
  async findByCnpj(): Promise<Company | null> {
    return this.company;
  }
  async findByEmail(): Promise<Company | null> {
    return this.company;
  }
  async existsByCnpj(): Promise<boolean> {
    return false;
  }
  async existsByEmail(): Promise<boolean> {
    return false;
  }
}

function jobPostingFixture(status: "PUBLISHED" | "CLOSED" = "PUBLISHED"): JobPosting {
  return JobPosting.restore({
    id: "job-1",
    companyId: "company-1",
    title: "Vaga de teste",
    description: "Descrição",
    requirements: "Requisitos",
    salaryRange: SalaryRange.create(300000, 500000),
    location: "Remoto",
    contactInfo: ContactInfo.create({ email: "vagas@empresa.com" }),
    unlockCost: CreditAmount.of(10),
    status,
    rejectionReason: null,
    publishedAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
  });
}

function companyFixture(): Company {
  return Company.restore({
    id: "company-1",
    cnpj: Cnpj.create("11222333000181"),
    razaoSocial: "Empresa Teste LTDA",
    nomeFantasia: "Empresa Teste",
    email: Email.create("contato@empresa-teste.com"),
    passwordHash: "hash",
    status: "ACTIVE",
    createdAt: new Date(),
  });
}

describe("GetJobPostingDetailsForWorkerUseCase", () => {
  it("retorna a visão anonimizada quando o trabalhador não desbloqueou a vaga", async () => {
    const useCase = new GetJobPostingDetailsForWorkerUseCase(
      new StubJobUnlockRepository(null),
      new StubJobPostingRepository(jobPostingFixture()),
      new StubCompanyRepository(companyFixture()),
    );

    const result = await useCase.execute("worker-1", "job-1");
    expect(result).not.toHaveProperty("companyName");
    expect(result).not.toHaveProperty("contactInfo");
  });

  it("retorna a visão desbloqueada (com nome da empresa e contato) quando já desbloqueou", async () => {
    const unlock = JobUnlock.create({ workerId: "worker-1", jobPostingId: "job-1", creditsSpent: CreditAmount.of(10) });
    const useCase = new GetJobPostingDetailsForWorkerUseCase(
      new StubJobUnlockRepository(unlock),
      new StubJobPostingRepository(jobPostingFixture()),
      new StubCompanyRepository(companyFixture()),
    );

    const result = await useCase.execute("worker-1", "job-1");
    expect((result as { companyName: string }).companyName).toBe("Empresa Teste");
    expect((result as { contactInfo: { email: string | null } }).contactInfo.email).toBe("vagas@empresa.com");
  });

  it("mantém acesso à vaga desbloqueada mesmo depois de encerrada (regra 22)", async () => {
    const unlock = JobUnlock.create({ workerId: "worker-1", jobPostingId: "job-1", creditsSpent: CreditAmount.of(10) });
    const useCase = new GetJobPostingDetailsForWorkerUseCase(
      new StubJobUnlockRepository(unlock),
      new StubJobPostingRepository(jobPostingFixture("CLOSED")),
      new StubCompanyRepository(companyFixture()),
    );

    const result = await useCase.execute("worker-1", "job-1");
    expect((result as { companyName: string }).companyName).toBe("Empresa Teste");
  });
});
