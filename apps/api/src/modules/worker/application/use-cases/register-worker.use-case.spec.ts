import {
  ConsentEntry,
  ConsentLog,
} from "../../../../shared-kernel/application/consent-log.port";
import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Cpf } from "../../../../shared-kernel/domain/cpf.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import {
  LegalConsentRequiredError,
  TERMS_OF_USE_VERSION,
} from "../../../../shared-kernel/domain/legal-consent.vo";
import { Worker } from "../../domain/worker.entity";
import { CpfAlreadyRegisteredError, WorkerEmailAlreadyRegisteredError } from "../errors";
import { WorkerRepository } from "../ports/worker-repository.port";
import { RegisterWorkerUseCase } from "./register-worker.use-case";

class InMemoryWorkerRepository implements WorkerRepository {
  private workers: Worker[] = [];

  async save(worker: Worker): Promise<void> {
    this.workers = this.workers.filter((w) => w.id !== worker.id);
    this.workers.push(worker);
  }

  async findById(id: string): Promise<Worker | null> {
    return this.workers.find((w) => w.id === id) ?? null;
  }

  async findByCpf(cpf: Cpf): Promise<Worker | null> {
    return this.workers.find((w) => w.cpf.equals(cpf)) ?? null;
  }

  async findByEmail(email: Email): Promise<Worker | null> {
    return this.workers.find((w) => w.email.equals(email)) ?? null;
  }

  async existsByCpf(cpf: Cpf): Promise<boolean> {
    return this.workers.some((w) => w.cpf.equals(cpf));
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return this.workers.some((w) => w.email.equals(email));
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

describe("RegisterWorkerUseCase", () => {
  const validInput = {
    cpf: "529.982.247-25",
    nome: "Trabalhador Teste",
    email: "trabalhador@teste.com",
    password: "senha-segura",
    consent: { acceptTerms: true, acceptPrivacyPolicy: true, confirmAdult: true },
    context: { ipAddress: "203.0.113.7", userAgent: "jest" },
  };

  it("registra um trabalhador com dados válidos", async () => {
    const repository = new InMemoryWorkerRepository();
    const useCase = new RegisterWorkerUseCase(
      repository,
      new FakePasswordHasher(),
      new InMemoryConsentLog(),
    );

    const result = await useCase.execute(validInput);

    const saved = await repository.findById(result.workerId);
    expect(saved).not.toBeNull();
    expect(saved?.cpf.value).toBe("52998224725");
    expect(saved?.status).toBe("ACTIVE");
  });

  it("rejeita dois trabalhadores com o mesmo CPF (regra 2)", async () => {
    const repository = new InMemoryWorkerRepository();
    const useCase = new RegisterWorkerUseCase(
      repository,
      new FakePasswordHasher(),
      new InMemoryConsentLog(),
    );

    await useCase.execute(validInput);

    await expect(
      useCase.execute({ ...validInput, email: "outro-email@teste.com" }),
    ).rejects.toThrow(CpfAlreadyRegisteredError);
  });

  it("rejeita dois trabalhadores com o mesmo e-mail", async () => {
    const repository = new InMemoryWorkerRepository();
    const useCase = new RegisterWorkerUseCase(
      repository,
      new FakePasswordHasher(),
      new InMemoryConsentLog(),
    );

    await useCase.execute(validInput);

    await expect(
      useCase.execute({ ...validInput, cpf: "111.444.777-35" }),
    ).rejects.toThrow(WorkerEmailAlreadyRegisteredError);
  });

  it("grava o aceite dos Termos e da Política com a versão vigente", async () => {
    const repository = new InMemoryWorkerRepository();
    const consentLog = new InMemoryConsentLog();
    const useCase = new RegisterWorkerUseCase(
      repository,
      new FakePasswordHasher(),
      consentLog,
    );

    const result = await useCase.execute(validInput);

    expect(consentLog.entries).toHaveLength(1);
    expect(consentLog.entries[0]).toMatchObject({
      subjectRole: "WORKER",
      subjectId: result.workerId,
      consent: { termsVersion: TERMS_OF_USE_VERSION },
      context: { ipAddress: "203.0.113.7" },
    });
  });

  it("não cria a conta sem o aceite dos Termos", async () => {
    const repository = new InMemoryWorkerRepository();
    const consentLog = new InMemoryConsentLog();
    const useCase = new RegisterWorkerUseCase(
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
    const repository = new InMemoryWorkerRepository();
    const useCase = new RegisterWorkerUseCase(
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
