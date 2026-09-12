import { randomUUID } from "node:crypto";
import { ConflictError } from "../../../shared-kernel/domain/domain-error";
import { CreditAmount } from "../../../shared-kernel/domain/credit-amount.vo";
import { Money } from "../../../shared-kernel/domain/money.vo";

export type PaymentStatus = "PENDING" | "CONFIRMED" | "EXPIRED";

export class InvalidPaymentStateError extends ConflictError {}

export interface PaymentProps {
  id: string;
  workerId: string;
  creditPackageId: string;
  amount: Money;
  creditsAmount: CreditAmount;
  status: PaymentStatus;
  pixTxId: string;
  pixE2eId: string | null;
  createdAt: Date;
  expiresAt: Date;
  confirmedAt: Date | null;
}

export class Payment {
  private constructor(private readonly props: PaymentProps) {}

  static create(input: {
    workerId: string;
    creditPackageId: string;
    amount: Money;
    creditsAmount: CreditAmount;
    expiresAt: Date;
  }): Payment {
    // O id é gerado sem hífens para poder ser usado diretamente como txid do
    // Pix (a API do Banco Inter exige txid alfanumérico, sem hífens) — ver
    // docs/03-arquitetura-tecnica.md, seção 4.2.
    const id = randomUUID().replace(/-/g, "");
    return new Payment({
      id,
      workerId: input.workerId,
      creditPackageId: input.creditPackageId,
      amount: input.amount,
      creditsAmount: input.creditsAmount,
      status: "PENDING",
      pixTxId: id,
      pixE2eId: null,
      createdAt: new Date(),
      expiresAt: input.expiresAt,
      confirmedAt: null,
    });
  }

  static restore(props: PaymentProps): Payment {
    return new Payment(props);
  }

  /** Idempotente: uma segunda confirmação do mesmo pagamento é um no-op (regra 17). */
  confirm(e2eId: string | null, confirmedAt: Date = new Date()): boolean {
    if (this.props.status === "CONFIRMED") {
      return false;
    }
    if (this.props.status !== "PENDING") {
      throw new InvalidPaymentStateError(`Não é possível confirmar um pagamento com status ${this.props.status}`);
    }
    this.props.status = "CONFIRMED";
    this.props.pixE2eId = e2eId;
    this.props.confirmedAt = confirmedAt;
    return true;
  }

  expire(now: Date = new Date()): void {
    if (this.props.status !== "PENDING") {
      throw new InvalidPaymentStateError(`Não é possível expirar um pagamento com status ${this.props.status}`);
    }
    if (now < this.props.expiresAt) {
      throw new InvalidPaymentStateError("O pagamento ainda não atingiu a data de expiração");
    }
    this.props.status = "EXPIRED";
  }

  get id(): string {
    return this.props.id;
  }

  get workerId(): string {
    return this.props.workerId;
  }

  get creditPackageId(): string {
    return this.props.creditPackageId;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get creditsAmount(): CreditAmount {
    return this.props.creditsAmount;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get pixTxId(): string {
    return this.props.pixTxId;
  }

  get pixE2eId(): string | null {
    return this.props.pixE2eId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get confirmedAt(): Date | null {
    return this.props.confirmedAt;
  }
}
