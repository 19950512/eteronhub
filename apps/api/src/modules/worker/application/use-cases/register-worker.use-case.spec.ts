import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Cpf } from "../../../../shared-kernel/domain/cpf.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
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
  };

  it("registra um trabalhador com dados válidos", async () => {
    const repository = new InMemoryWorkerRepository();
    const useCase = new RegisterWorkerUseCase(repository, new FakePasswordHasher());

    const result = await useCase.execute(validInput);

    const saved = await repository.findById(result.workerId);
    expect(saved).not.toBeNull();
    expect(saved?.cpf.value).toBe("52998224725");
    expect(saved?.status).toBe("ACTIVE");
  });

  it("rejeita dois trabalhadores com o mesmo CPF (regra 2)", async () => {
    const repository = new InMemoryWorkerRepository();
    const useCase = new RegisterWorkerUseCase(repository, new FakePasswordHasher());

    await useCase.execute(validInput);

    await expect(
      useCase.execute({ ...validInput, email: "outro-email@teste.com" }),
    ).rejects.toThrow(CpfAlreadyRegisteredError);
  });

  it("rejeita dois trabalhadores com o mesmo e-mail", async () => {
    const repository = new InMemoryWorkerRepository();
    const useCase = new RegisterWorkerUseCase(repository, new FakePasswordHasher());

    await useCase.execute(validInput);

    await expect(useCase.execute({ ...validInput, cpf: "111.444.777-35" })).rejects.toThrow(
      WorkerEmailAlreadyRegisteredError,
    );
  });
});
