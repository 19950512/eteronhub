import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { Cpf } from "../../../../shared-kernel/domain/cpf.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { PhoneNumber } from "../../../../shared-kernel/domain/phone-number.vo";
import { WorkerRepository } from "../../../worker/application/ports/worker-repository.port";
import { Worker, WorkerAccountDeletedError } from "../../../worker/domain/worker.entity";
import { AccountNotFoundError, DeletionPasswordMismatchError } from "../errors";
import { DeleteWorkerAccountUseCase } from "./delete-worker-account.use-case";

class InMemoryWorkerRepository implements WorkerRepository {
  readonly workers = new Map<string, Worker>();

  async save(worker: Worker): Promise<void> {
    this.workers.set(worker.id, worker);
  }

  async findById(id: string): Promise<Worker | null> {
    return this.workers.get(id) ?? null;
  }

  async findByCpf(cpf: Cpf): Promise<Worker | null> {
    return [...this.workers.values()].find((w) => w.cpf.equals(cpf)) ?? null;
  }

  async findByEmail(email: Email): Promise<Worker | null> {
    return [...this.workers.values()].find((w) => w.email.equals(email)) ?? null;
  }

  async existsByCpf(cpf: Cpf): Promise<boolean> {
    return (await this.findByCpf(cpf)) !== null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return (await this.findByEmail(email)) !== null;
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

function registeredWorker(): Worker {
  const worker = Worker.register({
    cpf: Cpf.create("529.982.247-25"),
    nome: "Maria Soldadora",
    email: Email.create("maria@exemplo.com"),
    passwordHash: "hashed:senha-segura",
  });
  worker.updateProfile({
    phone: PhoneNumber.create("(31) 99999-1234"),
    bio: "Soldadora TIG há 10 anos",
    segments: ["GALPOES"],
    softwares: [],
  });
  return worker;
}

describe("DeleteWorkerAccountUseCase", () => {
  const now = new Date("2026-11-25T12:00:00Z");

  it("anonimiza os dados pessoais e encerra a conta, mantendo o CPF", async () => {
    const repository = new InMemoryWorkerRepository();
    const worker = registeredWorker();
    await repository.save(worker);
    const useCase = new DeleteWorkerAccountUseCase(repository, new FakePasswordHasher());

    await useCase.execute(worker.id, "senha-segura", now);

    const deleted = await repository.findById(worker.id);
    expect(deleted?.status).toBe("DELETED");
    expect(deleted?.deletedAt).toEqual(now);
    expect(deleted?.nome).toBe("Conta excluída");
    expect(deleted?.email.value).not.toContain("maria");
    expect(deleted?.phone).toBeNull();
    expect(deleted?.bio).toBeNull();
    expect(deleted?.segments).toEqual([]);
    expect(deleted?.cpf.value).toBe("52998224725");
    expect(await repository.existsByEmail(Email.create("maria@exemplo.com"))).toBe(false);
  });

  it("não exclui com a senha errada", async () => {
    const repository = new InMemoryWorkerRepository();
    const worker = registeredWorker();
    await repository.save(worker);
    const useCase = new DeleteWorkerAccountUseCase(repository, new FakePasswordHasher());

    await expect(useCase.execute(worker.id, "outra-senha", now)).rejects.toThrow(
      DeletionPasswordMismatchError,
    );
    expect((await repository.findById(worker.id))?.status).toBe("ACTIVE");
  });

  it("falha para conta inexistente", async () => {
    const useCase = new DeleteWorkerAccountUseCase(
      new InMemoryWorkerRepository(),
      new FakePasswordHasher(),
    );
    await expect(useCase.execute("nao-existe", "senha-segura", now)).rejects.toThrow(
      AccountNotFoundError,
    );
  });

  it("conta excluída não pode ser suspensa nem reativada pelo admin", async () => {
    const worker = registeredWorker();
    worker.deleteAccount(now);
    expect(() => worker.suspend()).toThrow(WorkerAccountDeletedError);
    expect(() => worker.reactivate()).toThrow(WorkerAccountDeletedError);
    expect(() => worker.deleteAccount(now)).toThrow(WorkerAccountDeletedError);
  });
});
