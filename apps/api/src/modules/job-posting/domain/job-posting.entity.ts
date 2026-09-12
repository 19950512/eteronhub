import { randomUUID } from "node:crypto";
import { ConflictError, ValidationError } from "../../../shared-kernel/domain/domain-error";
import { ContactInfo } from "./contact-info.vo";
import { SalaryRange } from "./salary-range.vo";
import { CreditAmount } from "../../../shared-kernel/domain/credit-amount.vo";

export type JobPostingStatus = "DRAFT" | "IN_MODERATION" | "PUBLISHED" | "REJECTED" | "CLOSED" | "EXPIRED";

export class InvalidJobPostingStateError extends ConflictError {}
export class MissingRejectionReasonError extends ValidationError {}

export interface JobPostingProps {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string;
  salaryRange: SalaryRange;
  location: string;
  contactInfo: ContactInfo;
  unlockCost: CreditAmount;
  status: JobPostingStatus;
  rejectionReason: string | null;
  publishedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface JobPostingDraftInput {
  title: string;
  description: string;
  requirements: string;
  salaryRange: SalaryRange;
  location: string;
  contactInfo: ContactInfo;
  unlockCost: CreditAmount;
}

export interface JobPostingPublicView {
  id: string;
  title: string;
  description: string;
  requirements: string;
  salaryRangeCents: { min: number; max: number };
  location: string;
  unlockCost: number;
  publishedAt: Date | null;
  expiresAt: Date | null;
}

export interface JobPostingInternalView extends JobPostingPublicView {
  companyId: string;
  status: JobPostingStatus;
  contactInfo: { email: string | null; phone: string | null; applicationUrl: string | null };
  rejectionReason: string | null;
  createdAt: Date;
}

export class JobPosting {
  private constructor(private readonly props: JobPostingProps) {}

  static create(input: JobPostingDraftInput & { companyId: string }): JobPosting {
    return new JobPosting({
      id: randomUUID(),
      companyId: input.companyId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      salaryRange: input.salaryRange,
      location: input.location,
      contactInfo: input.contactInfo,
      unlockCost: input.unlockCost,
      status: "DRAFT",
      rejectionReason: null,
      publishedAt: null,
      expiresAt: null,
      createdAt: new Date(),
    });
  }

  static restore(props: JobPostingProps): JobPosting {
    return new JobPosting(props);
  }

  updateDraft(input: JobPostingDraftInput): void {
    this.ensureStatus("DRAFT", "editar");
    this.props.title = input.title;
    this.props.description = input.description;
    this.props.requirements = input.requirements;
    this.props.salaryRange = input.salaryRange;
    this.props.location = input.location;
    this.props.contactInfo = input.contactInfo;
    this.props.unlockCost = input.unlockCost;
  }

  submitForModeration(): void {
    if (this.props.status !== "DRAFT" && this.props.status !== "REJECTED") {
      throw new InvalidJobPostingStateError(
        `Não é possível submeter para moderação uma vaga com status ${this.props.status}`,
      );
    }
    this.props.status = "IN_MODERATION";
    this.props.rejectionReason = null;
  }

  approve(publishedAt: Date, expiresAt: Date): void {
    this.ensureStatus("IN_MODERATION", "aprovar");
    this.props.status = "PUBLISHED";
    this.props.publishedAt = publishedAt;
    this.props.expiresAt = expiresAt;
  }

  reject(reason: string): void {
    this.ensureStatus("IN_MODERATION", "rejeitar");
    if (!reason || reason.trim().length === 0) {
      throw new MissingRejectionReasonError("O motivo da rejeição é obrigatório");
    }
    this.props.status = "REJECTED";
    this.props.rejectionReason = reason;
  }

  close(): void {
    this.ensureStatus("PUBLISHED", "encerrar");
    this.props.status = "CLOSED";
  }

  expire(now: Date): void {
    this.ensureStatus("PUBLISHED", "expirar");
    if (!this.props.expiresAt || now < this.props.expiresAt) {
      throw new InvalidJobPostingStateError("A vaga ainda não atingiu a data de expiração");
    }
    this.props.status = "EXPIRED";
  }

  private ensureStatus(expected: JobPostingStatus, action: string): void {
    if (this.props.status !== expected) {
      throw new InvalidJobPostingStateError(`Não é possível ${action} uma vaga com status ${this.props.status}`);
    }
  }

  toPublicView(): JobPostingPublicView {
    return {
      id: this.props.id,
      title: this.props.title,
      description: this.props.description,
      requirements: this.props.requirements,
      salaryRangeCents: {
        min: this.props.salaryRange.minValue.valueInCents,
        max: this.props.salaryRange.maxValue.valueInCents,
      },
      location: this.props.location,
      unlockCost: this.props.unlockCost.value,
      publishedAt: this.props.publishedAt,
      expiresAt: this.props.expiresAt,
    };
  }

  toInternalView(): JobPostingInternalView {
    return {
      ...this.toPublicView(),
      companyId: this.props.companyId,
      status: this.props.status,
      contactInfo: {
        email: this.props.contactInfo.email,
        phone: this.props.contactInfo.phone,
        applicationUrl: this.props.contactInfo.applicationUrl,
      },
      rejectionReason: this.props.rejectionReason,
      createdAt: this.props.createdAt,
    };
  }

  get id(): string {
    return this.props.id;
  }

  get companyId(): string {
    return this.props.companyId;
  }

  get status(): JobPostingStatus {
    return this.props.status;
  }

  get expiresAt(): Date | null {
    return this.props.expiresAt;
  }
}
