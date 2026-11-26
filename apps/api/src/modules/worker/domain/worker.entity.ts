import { randomUUID } from "node:crypto";
import {
  ConflictError,
  ValidationError,
} from "../../../shared-kernel/domain/domain-error";
import { Cpf } from "../../../shared-kernel/domain/cpf.vo";
import { Email } from "../../../shared-kernel/domain/email.vo";
import { PhoneNumber } from "../../../shared-kernel/domain/phone-number.vo";
import { WorkerSegment } from "./worker-segment";
import { WorkerSoftware } from "./worker-software.vo";

export type WorkerStatus = "ACTIVE" | "SUSPENDED";

export class WorkerAlreadySuspendedError extends ConflictError {}
export class WorkerNotSuspendedError extends ConflictError {}
export class InvalidWorkerProfileError extends ValidationError {}

export const WORKER_BIO_MAX_LENGTH = 2000;
export const WORKER_MAX_SEGMENTS = 10;
export const WORKER_MAX_SOFTWARES = 20;

export interface WorkerProps {
  id: string;
  cpf: Cpf;
  nome: string;
  email: Email;
  passwordHash: string;
  status: WorkerStatus;
  phone: PhoneNumber | null;
  bio: string | null;
  segments: WorkerSegment[];
  softwares: WorkerSoftware[];
  createdAt: Date;
}

export interface WorkerProfileInput {
  phone: PhoneNumber | null;
  bio: string | null;
  segments: WorkerSegment[];
  softwares: WorkerSoftware[];
}

export interface WorkerProfileView {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  phone: string | null;
  bio: string | null;
  segments: WorkerSegment[];
  softwares: { name: string; version: string | null }[];
  createdAt: Date;
}

export class Worker {
  private constructor(private readonly props: WorkerProps) {}

  static register(input: {
    cpf: Cpf;
    nome: string;
    email: Email;
    passwordHash: string;
  }): Worker {
    return new Worker({
      id: randomUUID(),
      cpf: input.cpf,
      nome: input.nome,
      email: input.email,
      passwordHash: input.passwordHash,
      status: "ACTIVE",
      phone: null,
      bio: null,
      segments: [],
      softwares: [],
      createdAt: new Date(),
    });
  }

  static restore(props: WorkerProps): Worker {
    return new Worker(props);
  }

  updateProfile(input: WorkerProfileInput): void {
    const bio = input.bio?.trim() || null;
    if (bio && bio.length > WORKER_BIO_MAX_LENGTH) {
      throw new InvalidWorkerProfileError(
        `"Sobre mim" deve ter no máximo ${WORKER_BIO_MAX_LENGTH} caracteres`,
      );
    }

    const segments = [...new Set(input.segments)];
    if (segments.length > WORKER_MAX_SEGMENTS) {
      throw new InvalidWorkerProfileError(
        `Selecione no máximo ${WORKER_MAX_SEGMENTS} segmentos de atuação`,
      );
    }

    if (input.softwares.length > WORKER_MAX_SOFTWARES) {
      throw new InvalidWorkerProfileError(
        `Informe no máximo ${WORKER_MAX_SOFTWARES} softwares`,
      );
    }
    input.softwares.forEach((software, index) => {
      if (
        input.softwares
          .slice(0, index)
          .some((previous) => previous.isSameSoftware(software))
      ) {
        throw new InvalidWorkerProfileError(`Software repetido: ${software.name}`);
      }
    });

    this.props.phone = input.phone;
    this.props.bio = bio;
    this.props.segments = segments;
    this.props.softwares = [...input.softwares];
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

  toProfileView(): WorkerProfileView {
    return {
      id: this.props.id,
      nome: this.props.nome,
      cpf: this.props.cpf.format(),
      email: this.props.email.value,
      phone: this.props.phone?.value ?? null,
      bio: this.props.bio,
      segments: [...this.props.segments],
      softwares: this.props.softwares.map((software) => ({
        name: software.name,
        version: software.version,
      })),
      createdAt: this.props.createdAt,
    };
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

  get phone(): PhoneNumber | null {
    return this.props.phone;
  }

  get bio(): string | null {
    return this.props.bio;
  }

  get segments(): readonly WorkerSegment[] {
    return this.props.segments;
  }

  get softwares(): readonly WorkerSoftware[] {
    return this.props.softwares;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
