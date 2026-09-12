import { randomUUID } from "node:crypto";
import { ConflictError } from "../../../shared-kernel/domain/domain-error";
import { Cpf } from "../../../shared-kernel/domain/cpf.vo";
import { Email } from "../../../shared-kernel/domain/email.vo";

export type WorkerStatus = "ACTIVE" | "SUSPENDED";

export class WorkerAlreadySuspendedError extends ConflictError {}
export class WorkerNotSuspendedError extends ConflictError {}

export interface WorkerProps {
  id: string;
  cpf: Cpf;
  nome: string;
  email: Email;
  passwordHash: string;
  status: WorkerStatus;
  createdAt: Date;
}

export class Worker {
  private constructor(private readonly props: WorkerProps) {}

  static register(input: { cpf: Cpf; nome: string; email: Email; passwordHash: string }): Worker {
    return new Worker({
      id: randomUUID(),
      cpf: input.cpf,
      nome: input.nome,
      email: input.email,
      passwordHash: input.passwordHash,
      status: "ACTIVE",
      createdAt: new Date(),
    });
  }

  static restore(props: WorkerProps): Worker {
    return new Worker(props);
  }

  suspend(): void {
    if (this.props.status === "SUSPENDED") {
      throw new WorkerAlreadySuspendedError("Trabalhador já está suspenso");
    }
    this.props.status = "SUSPENDED";
  }

  reactivate(): void {
    if (this.props.status !== "SUSPENDED") {
      throw new WorkerNotSuspendedError("Trabalhador não está suspenso");
    }
    this.props.status = "ACTIVE";
  }

  get id(): string {
    return this.props.id;
  }

  get cpf(): Cpf {
    return this.props.cpf;
  }

  get nome(): string {
    return this.props.nome;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get status(): WorkerStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
