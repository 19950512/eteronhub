import { randomUUID } from "node:crypto";
import { CreditAmount } from "../../../shared-kernel/domain/credit-amount.vo";

export type CreditTransactionType = "TOPUP" | "DEBIT";

export interface CreditTransactionProps {
  id: string;
  walletId: string;
  type: CreditTransactionType;
  amount: CreditAmount;
  relatedPaymentId: string | null;
  relatedJobUnlockId: string | null;
  createdAt: Date;
}

export class CreditTransaction {
  private constructor(private readonly props: CreditTransactionProps) {}

  static topUp(input: { walletId: string; amount: CreditAmount; relatedPaymentId: string }): CreditTransaction {
    return new CreditTransaction({
      id: randomUUID(),
      walletId: input.walletId,
      type: "TOPUP",
      amount: input.amount,
      relatedPaymentId: input.relatedPaymentId,
      relatedJobUnlockId: null,
      createdAt: new Date(),
    });
  }

  static debit(input: { walletId: string; amount: CreditAmount; relatedJobUnlockId: string }): CreditTransaction {
    return new CreditTransaction({
      id: randomUUID(),
      walletId: input.walletId,
      type: "DEBIT",
      amount: input.amount,
      relatedPaymentId: null,
      relatedJobUnlockId: input.relatedJobUnlockId,
      createdAt: new Date(),
    });
  }

  static restore(props: CreditTransactionProps): CreditTransaction {
    return new CreditTransaction(props);
  }

  get id(): string {
    return this.props.id;
  }

  get walletId(): string {
    return this.props.walletId;
  }

  get type(): CreditTransactionType {
    return this.props.type;
  }

  get amount(): CreditAmount {
    return this.props.amount;
  }

  get relatedPaymentId(): string | null {
    return this.props.relatedPaymentId;
  }

  get relatedJobUnlockId(): string | null {
    return this.props.relatedJobUnlockId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
