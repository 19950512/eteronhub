import { Cpf } from "../../../../shared-kernel/domain/cpf.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { InvalidPhoneNumberError } from "../../../../shared-kernel/domain/phone-number.vo";
import { InvalidWorkerProfileError, Worker } from "../../domain/worker.entity";
import { InvalidWorkerSegmentError } from "../../domain/worker-segment";
import { WorkerNotFoundError } from "../errors";
import { WorkerRepository } from "../ports/worker-repository.port";
import { GetWorkerProfileUseCase } from "./get-worker-profile.use-case";
import { UpdateWorkerProfileUseCase } from "./update-worker-profile.use-case";

class SingleWorkerRepository implements WorkerRepository {
  saved = 0;
  constructor(private worker: Worker | null) {}
  async save(worker: Worker): Promise<void> {
    this.worker = worker;
    this.saved += 1;
  }
  async findById(id: string): Promise<Worker | null> {
    return this.worker?.id === id ? this.worker : null;
  }
  async findByCpf(): Promise<Worker | null> {
    return null;
  }
  async findByEmail(): Promise<Worker | null> {
    return null;
  }
  async existsByCpf(): Promise<boolean> {
    return false;
  }
  async existsByEmail(): Promise<boolean> {
    return false;
  }
}

function newWorker(): Worker {
  return Worker.register({
    cpf: Cpf.create("52998224725"),
    nome: "João da Silva",
    email: Email.create("joao@example.com"),
    passwordHash: "hash",
  });
}

describe("UpdateWorkerProfileUseCase", () => {
  it("atualiza telefone, bio, segmentos e softwares e devolve o perfil", async () => {
    const worker = newWorker();
    const repository = new SingleWorkerRepository(worker);

    const view = await new UpdateWorkerProfileUseCase(repository).execute(worker.id, {
      phone: "(11) 98765-4321",
      bio: "  Soldador MIG/MAG com 10 anos de experiência.  ",
      segments: ["GALPOES", "CALDEIRARIA", "GALPOES"],
      softwares: [
        { name: " Tekla  Structures ", version: "2024.1" },
        { name: "AutoCAD" },
      ],
    });

    expect(view).toMatchObject({
      phone: "11987654321",
      bio: "Soldador MIG/MAG com 10 anos de experiência.",
      segments: ["GALPOES", "CALDEIRARIA"],
      softwares: [
        { name: "Tekla Structures", version: "2024.1" },
        { name: "AutoCAD", version: null },
      ],
    });
    expect(repository.saved).toBe(1);
    expect(await new GetWorkerProfileUseCase(repository).execute(worker.id)).toEqual(
      view,
    );
  });

  it("limpa os campos que não forem enviados", async () => {
    const worker = newWorker();
    const repository = new SingleWorkerRepository(worker);
    const useCase = new UpdateWorkerProfileUseCase(repository);
    await useCase.execute(worker.id, {
      phone: "11987654321",
      bio: "bio",
      segments: ["TORRES"],
    });

    const view = await useCase.execute(worker.id, {});

    expect(view).toMatchObject({ phone: null, bio: null, segments: [], softwares: [] });
  });

  it("rejeita segmento desconhecido", async () => {
    const worker = newWorker();
    await expect(
      new UpdateWorkerProfileUseCase(new SingleWorkerRepository(worker)).execute(
        worker.id,
        {
          segments: ["PADARIA"],
        },
      ),
    ).rejects.toThrow(InvalidWorkerSegmentError);
  });

  it("rejeita mais de 10 segmentos", async () => {
    const worker = newWorker();
    const segments = [
      "TORRES",
      "GALPOES",
      "ESTRUTURAS_RESIDENCIAIS",
      "ESTRUTURAS_COMERCIAIS",
      "ESTRUTURAS_INDUSTRIAIS",
      "PONTES_VIADUTOS",
      "PLATAFORMAS",
      "ESCADAS_CORRIMAOS",
      "PORTOES_GRADES",
      "COBERTURA_METALICA",
      "MEZANINO",
    ];
    await expect(
      new UpdateWorkerProfileUseCase(new SingleWorkerRepository(worker)).execute(
        worker.id,
        { segments },
      ),
    ).rejects.toThrow(InvalidWorkerProfileError);
  });

  it("rejeita software repetido (sem diferenciar maiúsculas)", async () => {
    const worker = newWorker();
    await expect(
      new UpdateWorkerProfileUseCase(new SingleWorkerRepository(worker)).execute(
        worker.id,
        {
          softwares: [{ name: "Tekla" }, { name: "tekla" }],
        },
      ),
    ).rejects.toThrow(InvalidWorkerProfileError);
  });

  it("rejeita bio acima de 2000 caracteres", async () => {
    const worker = newWorker();
    await expect(
      new UpdateWorkerProfileUseCase(new SingleWorkerRepository(worker)).execute(
        worker.id,
        {
          bio: "a".repeat(2001),
        },
      ),
    ).rejects.toThrow(InvalidWorkerProfileError);
  });

  it("rejeita telefone inválido sem salvar", async () => {
    const worker = newWorker();
    const repository = new SingleWorkerRepository(worker);
    await expect(
      new UpdateWorkerProfileUseCase(repository).execute(worker.id, { phone: "1234" }),
    ).rejects.toThrow(InvalidPhoneNumberError);
    expect(repository.saved).toBe(0);
  });

  it("falha quando o trabalhador não existe", async () => {
    await expect(
      new UpdateWorkerProfileUseCase(new SingleWorkerRepository(null)).execute(
        "inexistente",
        {},
      ),
    ).rejects.toThrow(WorkerNotFoundError);
  });
});
