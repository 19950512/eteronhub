import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { CreditWalletRepository } from "../../../credit/application/ports/credit-wallet-repository.port";
import { CreditWallet, InsufficientCreditsError } from "../../../credit/domain/credit-wallet.entity";
import {
  JobPostingFilter,
  JobPostingRepository,
} from "../../../job-posting/application/ports/job-posting-repository.port";
import { ContactInfo } from "../../../job-posting/domain/contact-info.vo";
import { JobPosting } from "../../../job-posting/domain/job-posting.entity";
import { SalaryRange } from "../../../job-posting/domain/salary-range.vo";
import { JobUnlock } from "../../domain/job-unlock.entity";
import { JobPostingNotAvailableForUnlockError } from "../errors";
import { JobUnlockRepository } from "../ports/job-unlock-repository.port";
import { JobUnlockWriteResult, JobUnlockWriter, UnlockWriteInput } from "../ports/job-unlock-writer.port";
import { UnlockJobPostingUseCase } from "./unlock-job-posting.use-case";

class InMemoryJobPostingRepository implements JobPostingRepository {
  constructor(private readonly jobPostings: JobPosting[]) {}

  async save(jobPosting: JobPosting): Promise<void> {
    const index = this.jobPostings.findIndex((j) => j.id === jobPosting.id);
    if (index >= 0) this.jobPostings[index] = jobPosting;
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

  async findExpiredPublished(): Promise<JobPosting[]> {
    return [];
  }
}

class InMemoryCreditWalletRepository implements CreditWalletRepository {
  private wallets: CreditWallet[] = [];

  async save(wallet: CreditWallet): Promise<void> {
    this.wallets = this.wallets.filter((w) => w.id !== wallet.id);
    this.wallets.push(wallet);
  }

  async findByWorkerId(workerId: string): Promise<CreditWallet | null> {
    return this.wallets.find((w) => w.workerId === workerId) ?? null;
  }

  async getOrCreateForWorker(workerId: string): Promise<CreditWallet> {
    const existing = await this.findByWorkerId(workerId);
    if (existing) return existing;
    const created = CreditWallet.openFor(workerId);
    await this.save(created);
    return created;
  }
}

/** Estado compartilhado entre o repositório de leitura e o escritor, como uma tabela real seria. */
class JobUnlockStore {
  readonly unlocks = new Map<string, JobUnlock>();

  key(workerId: string, jobPostingId: string): string {
    return `${workerId}:${jobPostingId}`;
  }
}

class InMemoryJobUnlockRepository implements JobUnlockRepository {
  constructor(private readonly store: JobUnlockStore) {}

  async findByWorkerAndJobPosting(workerId: string, jobPostingId: string): Promise<JobUnlock | null> {
    return this.store.unlocks.get(this.store.key(workerId, jobPostingId)) ?? null;
  }

  async findByWorker(workerId: string): Promise<JobUnlock[]> {
    return [...this.store.unlocks.values()].filter((u) => u.workerId === workerId);
  }
}

/**
 * Simula, em memória, a mesma garantia que PrismaJobUnlockWriter obtém de
 * uma transação + constraint única: chamadas concorrentes para o MESMO
 * (workerId, jobPostingId) são serializadas por uma fila de promises
 * (equivalente a um lock de linha no banco); chamadas para pares diferentes
 * não se bloqueiam entre si.
 */
class InMemoryJobUnlockWriter implements JobUnlockWriter {
  private readonly queues = new Map<string, Promise<unknown>>();

  constructor(
    private readonly store: JobUnlockStore,
    private readonly creditWalletRepository: CreditWalletRepository,
  ) {}

  unlock(input: UnlockWriteInput): Promise<JobUnlockWriteResult> {
    const key = this.store.key(input.workerId, input.jobPostingId);
    const previous = this.queues.get(key) ?? Promise.resolve();
    const current = previous.then(
      () => this.doUnlock(key, input),
      () => this.doUnlock(key, input),
    );
    this.queues.set(key, current);
    return current;
  }

  private async doUnlock(key: string, input: UnlockWriteInput): Promise<JobUnlockWriteResult> {
    const existing = this.store.unlocks.get(key);
    if (existing) {
      return { jobUnlock: existing, alreadyExisted: true };
    }

    const wallet = await this.creditWalletRepository.getOrCreateForWorker(input.workerId);
    wallet.debit(input.unlockCost);
    await this.creditWalletRepository.save(wallet);

    const jobUnlock = JobUnlock.create({
      workerId: input.workerId,
      jobPostingId: input.jobPostingId,
      creditsSpent: input.unlockCost,
    });
    this.store.unlocks.set(key, jobUnlock);
    return { jobUnlock, alreadyExisted: false };
  }
}

function publishedJobPosting(input: { id: string; unlockCost: number }): JobPosting {
  return JobPosting.restore({
    id: input.id,
    companyId: "company-1",
    title: "Vaga de teste",
    description: "Descrição",
    requirements: "Requisitos",
    salaryRange: SalaryRange.create(300000, 500000),
    location: "Remoto",
    contactInfo: ContactInfo.create({ email: "vagas@empresa.com" }),
    unlockCost: CreditAmount.of(input.unlockCost),
    status: "PUBLISHED",
    rejectionReason: null,
    publishedAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
  });
}

function setup(jobPostings: JobPosting[]) {
  const jobPostingRepository = new InMemoryJobPostingRepository(jobPostings);
  const creditWalletRepository = new InMemoryCreditWalletRepository();
  const store = new JobUnlockStore();
  const jobUnlockRepository = new InMemoryJobUnlockRepository(store);
  const jobUnlockWriter = new InMemoryJobUnlockWriter(store, creditWalletRepository);
  const useCase = new UnlockJobPostingUseCase(jobUnlockRepository, jobUnlockWriter, jobPostingRepository);
  return { jobPostingRepository, creditWalletRepository, jobUnlockRepository, useCase };
}

describe("UnlockJobPostingUseCase", () => {
  it("debita os créditos e cria o registro de desbloqueio", async () => {
    const jobPosting = publishedJobPosting({ id: "job-1", unlockCost: 10 });
    const { creditWalletRepository, useCase } = setup([jobPosting]);

    const wallet = CreditWallet.openFor("worker-1");
    wallet.credit(CreditAmount.of(10));
    await creditWalletRepository.save(wallet);

    const result = await useCase.execute("worker-1", "job-1");

    expect(result.alreadyUnlocked).toBe(false);
    expect(result.creditsSpent).toBe(10);
    const finalWallet = await creditWalletRepository.findByWorkerId("worker-1");
    expect(finalWallet?.balance.value).toBe(0);
  });

  it("uma segunda chamada sequencial não debita créditos de novo (regra 13)", async () => {
    const jobPosting = publishedJobPosting({ id: "job-1", unlockCost: 10 });
    const { creditWalletRepository, useCase } = setup([jobPosting]);

    const wallet = CreditWallet.openFor("worker-1");
    wallet.credit(CreditAmount.of(10));
    await creditWalletRepository.save(wallet);

    await useCase.execute("worker-1", "job-1");
    const second = await useCase.execute("worker-1", "job-1");

    expect(second.alreadyUnlocked).toBe(true);
    const finalWallet = await creditWalletRepository.findByWorkerId("worker-1");
    expect(finalWallet?.balance.value).toBe(0);
  });

  it("duas chamadas CONCORRENTES para a mesma vaga resultam em um único débito (regra 13)", async () => {
    const jobPosting = publishedJobPosting({ id: "job-1", unlockCost: 10 });
    const { creditWalletRepository, useCase } = setup([jobPosting]);

    const wallet = CreditWallet.openFor("worker-1");
    wallet.credit(CreditAmount.of(10));
    await creditWalletRepository.save(wallet);

    const [resultA, resultB] = await Promise.all([
      useCase.execute("worker-1", "job-1"),
      useCase.execute("worker-1", "job-1"),
    ]);

    // Exatamente uma das duas chamadas "ganhou" a corrida e debitou; a outra
    // recebeu o resultado já existente.
    expect([resultA.alreadyUnlocked, resultB.alreadyUnlocked].sort()).toEqual([false, true]);

    const finalWallet = await creditWalletRepository.findByWorkerId("worker-1");
    expect(finalWallet?.balance.value).toBe(0); // 10 - 10, nunca 10 - 20
  });

  it("não debita e não cria desbloqueio se o saldo for insuficiente (regra 11)", async () => {
    const jobPosting = publishedJobPosting({ id: "job-1", unlockCost: 10 });
    const { creditWalletRepository, useCase, jobUnlockRepository } = setup([jobPosting]);

    const wallet = CreditWallet.openFor("worker-1");
    wallet.credit(CreditAmount.of(5));
    await creditWalletRepository.save(wallet);

    await expect(useCase.execute("worker-1", "job-1")).rejects.toThrow(InsufficientCreditsError);

    const finalWallet = await creditWalletRepository.findByWorkerId("worker-1");
    expect(finalWallet?.balance.value).toBe(5);
    expect(await jobUnlockRepository.findByWorkerAndJobPosting("worker-1", "job-1")).toBeNull();
  });

  it("rejeita o desbloqueio de uma vaga que não está publicada", async () => {
    const jobPosting = publishedJobPosting({ id: "job-1", unlockCost: 10 });
    jobPosting.close();
    const { creditWalletRepository, useCase } = setup([jobPosting]);

    const wallet = CreditWallet.openFor("worker-1");
    wallet.credit(CreditAmount.of(10));
    await creditWalletRepository.save(wallet);

    await expect(useCase.execute("worker-1", "job-1")).rejects.toThrow(JobPostingNotAvailableForUnlockError);
  });

  it("continua servindo um desbloqueio já existente mesmo depois da vaga ser encerrada (regra 22)", async () => {
    const jobPosting = publishedJobPosting({ id: "job-1", unlockCost: 10 });
    const { creditWalletRepository, useCase, jobPostingRepository } = setup([jobPosting]);

    const wallet = CreditWallet.openFor("worker-1");
    wallet.credit(CreditAmount.of(10));
    await creditWalletRepository.save(wallet);

    await useCase.execute("worker-1", "job-1");

    const stored = await jobPostingRepository.findById("job-1");
    stored?.close();
    if (stored) await jobPostingRepository.save(stored);

    const second = await useCase.execute("worker-1", "job-1");
    expect(second.alreadyUnlocked).toBe(true);
  });
});
