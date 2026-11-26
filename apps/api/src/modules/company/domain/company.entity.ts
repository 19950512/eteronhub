import { randomUUID } from "node:crypto";
import { BrazilianState } from "../../../shared-kernel/domain/brazilian-state.vo";
import {
  ConflictError,
  ValidationError,
} from "../../../shared-kernel/domain/domain-error";
import { Cnpj } from "../../../shared-kernel/domain/cnpj.vo";
import {
  DELETED_ACCOUNT_PASSWORD_HASH,
  deletedAccountEmail,
} from "../../../shared-kernel/domain/deleted-account";
import { Email } from "../../../shared-kernel/domain/email.vo";
import { PhoneNumber } from "../../../shared-kernel/domain/phone-number.vo";
import { CompanySector } from "./company-sector";
import { Website } from "./website.vo";

export type CompanyStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export class CompanyAlreadySuspendedError extends ConflictError {}
export class CompanyNotSuspendedError extends ConflictError {}
export class InvalidCompanyProfileError extends ValidationError {}
export class CompanyAccountDeletedError extends ConflictError {}

const NOME_FANTASIA_MIN_LENGTH = 2;
const NOME_FANTASIA_MAX_LENGTH = 100;
const CITY_MAX_LENGTH = 100;

export interface CompanyProps {
  id: string;
  cnpj: Cnpj;
  razaoSocial: string;
  nomeFantasia: string | null;
  email: Email;
  passwordHash: string;
  status: CompanyStatus;
  sector: CompanySector | null;
  city: string | null;
  state: BrazilianState | null;
  whatsapp: PhoneNumber | null;
  website: Website | null;
  createdAt: Date;
  deletedAt?: Date | null;
}

export interface CompanyProfileInput {
  nomeFantasia: string | null;
  sector: CompanySector | null;
  city: string | null;
  state: BrazilianState | null;
  whatsapp: PhoneNumber | null;
  website: Website | null;
}

// invariant: visão exclusiva da própria empresa (rota /companies/me). Nada
// daqui pode ir para a listagem pública — a empresa é anônima para o
// trabalhador até o desbloqueio, que expõe apenas o nome (ver JobPosting.toUnlockedView).
export interface CompanyProfileView {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  email: string;
  sector: CompanySector | null;
  city: string | null;
  state: string | null;
  whatsapp: string | null;
  website: string | null;
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
      sector: null,
      city: null,
      state: null,
      whatsapp: null,
      website: null,
      createdAt: new Date(),
    });
  }

  static restore(props: CompanyProps): Company {
    return new Company(props);
  }

  updateProfile(input: CompanyProfileInput): void {
    const nomeFantasia = input.nomeFantasia?.trim().replace(/\s+/g, " ") || null;
    if (
      nomeFantasia &&
      (nomeFantasia.length < NOME_FANTASIA_MIN_LENGTH ||
        nomeFantasia.length > NOME_FANTASIA_MAX_LENGTH)
    ) {
      throw new InvalidCompanyProfileError(
        `Nome fantasia deve ter entre ${NOME_FANTASIA_MIN_LENGTH} e ${NOME_FANTASIA_MAX_LENGTH} caracteres`,
      );
    }

    const city = input.city?.trim().replace(/\s+/g, " ") || null;
    if (city && city.length > CITY_MAX_LENGTH) {
      throw new InvalidCompanyProfileError(
        `Cidade deve ter no máximo ${CITY_MAX_LENGTH} caracteres`,
      );
    }
    if (Boolean(city) !== Boolean(input.state)) {
      throw new InvalidCompanyProfileError("Informe a cidade e a UF juntas");
    }

    this.props.nomeFantasia = nomeFantasia;
    this.props.sector = input.sector;
    this.props.city = city;
    this.props.state = input.state;
    this.props.whatsapp = input.whatsapp;
    this.props.website = input.website;
  }

  /**
   * Exclusão a pedido do titular (LGPD art. 18, VI): apaga contatos e dados de
   * perfil e encerra o acesso. As vagas da empresa são encerradas pelo caso de
   * uso que orquestra a exclusão.
   */
  deleteAccount(now: Date): void {
    this.ensureNotDeleted();
    // why: CNPJ e razão social ficam — são dados cadastrais públicos da pessoa
    // jurídica, aparecem no histórico de quem já pagou pelo desbloqueio e
    // identificam a empresa em eventual disputa (LGPD art. 16, I e II).
    this.props.nomeFantasia = null;
    this.props.email = deletedAccountEmail(this.props.id);
    this.props.passwordHash = DELETED_ACCOUNT_PASSWORD_HASH;
    this.props.sector = null;
    this.props.city = null;
    this.props.state = null;
    this.props.whatsapp = null;
    this.props.website = null;
    this.props.status = "DELETED";
    this.props.deletedAt = now;
  }

  suspend(): void {
    this.ensureNotDeleted();
    if (this.props.status === "SUSPENDED") {
      throw new CompanyAlreadySuspendedError("Empresa já está suspensa");
    }
    this.props.status = "SUSPENDED";
  }

  reactivate(): void {
    this.ensureNotDeleted();
    if (this.props.status !== "SUSPENDED") {
      throw new CompanyNotSuspendedError("Empresa não está suspensa");
    }
    this.props.status = "ACTIVE";
  }

  private ensureNotDeleted(): void {
    if (this.props.status === "DELETED") {
      throw new CompanyAccountDeletedError("Esta conta de empresa foi excluída");
    }
  }

  toProfileView(): CompanyProfileView {
    return {
      id: this.props.id,
      cnpj: this.props.cnpj.format(),
      razaoSocial: this.props.razaoSocial,
      nomeFantasia: this.props.nomeFantasia,
      email: this.props.email.value,
      sector: this.props.sector,
      city: this.props.city,
      state: this.props.state?.value ?? null,
      whatsapp: this.props.whatsapp?.value ?? null,
      website: this.props.website?.value ?? null,
      createdAt: this.props.createdAt,
    };
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

  get sector(): CompanySector | null {
    return this.props.sector;
  }

  get city(): string | null {
    return this.props.city;
  }

  get state(): BrazilianState | null {
    return this.props.state;
  }

  get whatsapp(): PhoneNumber | null {
    return this.props.whatsapp;
  }

  get website(): Website | null {
    return this.props.website;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }
}
