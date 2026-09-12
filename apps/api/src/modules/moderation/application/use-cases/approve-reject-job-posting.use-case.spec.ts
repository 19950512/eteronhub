import { JobPostingRepository, JobPostingFilter } from "../../../job-posting/application/ports/job-posting-repository.port";
import { ContactInfo } from "../../../job-posting/domain/contact-info.vo";
import { JobPosting } from "../../../job-posting/domain/job-posting.entity";
import { SalaryRange } from "../../../job-posting/domain/salary-range.vo";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { ModerationDecision } from "../../domain/moderation-decision.entity";
import { ModerationDecisionRepository } from "../ports/moderation-decision-repository.port";
import { ApproveJobPostingUseCase } from "./approve-job-posting.use-case";
import { RejectJobPostingUseCase } from "./reject-job-posting.use-case";

class InMemoryJobPostingRepository implements JobPostingRepository {
  private jobPostings: JobPosting[] = [];

  async save(jobPosting: JobPosting): Promise<void> {
    this.jobPostings = this.jobPostings.filter((j) => j.id !== jobPosting.id);
    this.jobPostings.push(jobPosting);
  }

  async findById(id: string): Promise<JobPosting | null> {
    return this.jobPostings.find((j) => j.id === id) ?? null;
  }

  async findByCompany(companyId: string): Promise<JobPosting[]> {
    return this.jobPostings.filter((j) => j.companyId === companyId);
  }

  async findPublished(_filter?: JobPostingFilter): Promise<JobPosting[]> {
    return this.jobPostings.filter((j) => j.status === "PUBLISHED");
  }

  async findPendingModeration(): Promise<JobPosting[]> {
    return this.jobPostings.filter((j) => j.status === "IN_MODERATION");
  }

  async findExpiredPublished(now: Date): Promise<JobPosting[]> {
    return this.jobPostings.filter((j) => j.status === "PUBLISHED" && j.expiresAt !== null && j.expiresAt <= now);
  }
}

class InMemoryModerationDecisionRepository implements ModerationDecisionRepository {
  decisions: ModerationDecision[] = [];

  async save(decision: ModerationDecision): Promise<void> {
    this.decisions.push(decision);
  }

  async findByJobPosting(jobPostingId: string): Promise<ModerationDecision[]> {
    return this.decisions.filter((d) => d.jobPostingId === jobPostingId);
  }
}

function createSubmittedJobPosting(): JobPosting {
  const jobPosting = JobPosting.create({
    companyId: "company-1",
    title: "Analista de Dados",
    description: "Descrição",
    requirements: "SQL, Python",
    salaryRange: SalaryRange.create(400000, 600000),
    location: "Remoto",
    contactInfo: ContactInfo.create({ email: "vagas@empresa.com" }),
    unlockCost: CreditAmount.of(15),
  });
  jobPosting.submitForModeration();
  return jobPosting;
}

describe("ApproveJobPostingUseCase", () => {
  it("publica a vaga e registra a decisão de moderação", async () => {
    const jobPostingRepository = new InMemoryJobPostingRepository();
    const moderationDecisionRepository = new InMemoryModerationDecisionRepository();
    const jobPosting = createSubmittedJobPosting();
    await jobPostingRepository.save(jobPosting);

    const useCase = new ApproveJobPostingUseCase(jobPostingRepository, moderationDecisionRepository);
    await useCase.execute(jobPosting.id, "admin-1");

    const saved = await jobPostingRepository.findById(jobPosting.id);
    expect(saved?.status).toBe("PUBLISHED");
    expect(moderationDecisionRepository.decisions).toHaveLength(1);
    expect(moderationDecisionRepository.decisions[0].decision).toBe("APPROVED");
    expect(moderationDecisionRepository.decisions[0].adminId).toBe("admin-1");
  });
});

describe("RejectJobPostingUseCase", () => {
  it("rejeita a vaga com motivo e registra a decisão de moderação (regra 7)", async () => {
    const jobPostingRepository = new InMemoryJobPostingRepository();
    const moderationDecisionRepository = new InMemoryModerationDecisionRepository();
    const jobPosting = createSubmittedJobPosting();
    await jobPostingRepository.save(jobPosting);

    const useCase = new RejectJobPostingUseCase(jobPostingRepository, moderationDecisionRepository);
    await useCase.execute(jobPosting.id, "admin-1", "Faltam informações sobre o salário");

    const saved = await jobPostingRepository.findById(jobPosting.id);
    expect(saved?.status).toBe("REJECTED");
    expect(moderationDecisionRepository.decisions[0].decision).toBe("REJECTED");
    expect(moderationDecisionRepository.decisions[0].reason).toBe("Faltam informações sobre o salário");
  });
});
