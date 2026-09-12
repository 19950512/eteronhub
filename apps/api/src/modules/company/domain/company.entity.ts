import { randomUUID } from "node:crypto";
import { ConflictError } from "../../../shared-kernel/domain/domain-error";
import { Cnpj } from "../../../shared-kernel/domain/cnpj.vo";
import { Email } from "../../../shared-kernel/domain/email.vo";

export type CompanyStatus = "ACTIVE" | "SUSPENDED";

export class CompanyAlreadySuspendedError extends ConflictError {}
export class CompanyNotSuspendedError extends ConflictError {}

export interface CompanyProps {
  id: string;
  cnpj: Cnpj;
  razaoSocial: string;
  nomeFantasia: string | null;
  email: Email;
  passwordHash: string;
  status: CompanyStatus;
  createdAt: Date;
}

export class Company {
  private constructor(private readonly props: CompanyProps) {}

  static register(input: {
    cnpj: Cnpj;
    razaoSocial: string;
    nomeFantasia?: string;
    email: Email;
    passwordHash: string;
  }): Company {
    return new Company({
      id: randomUUID(),
      cnpj: input.cnpj,
      razaoSocial: input.razaoSocial,
      nomeFantasia: input.nomeFantasia ?? null,
      email: input.email,
      passwordHash: input.passwordHash,
      status: "ACTIVE",
      createdAt: new Date(),
    });
  }

  static restore(props: CompanyProps): Company {
    return new Company(props);
  }

  suspend(): void {
    if (this.props.status === "SUSPENDED") {
      throw new CompanyAlreadySuspendedError("Empresa já está suspensa");
    }
    this.props.status = "SUSPENDED";
  }

  reactivate(): void {
    if (this.props.status !== "SUSPENDED") {
      throw new CompanyNotSuspendedError("Empresa não está suspensa");
    }
    this.props.status = "ACTIVE";
  }

  get id(): string {
    return this.props.id;
  }

  get cnpj(): Cnpj {
    return this.props.cnpj;
  }

  get razaoSocial(): string {
    return this.props.razaoSocial;
  }

  get nomeFantasia(): string | null {
    return this.props.nomeFantasia;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get status(): CompanyStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
