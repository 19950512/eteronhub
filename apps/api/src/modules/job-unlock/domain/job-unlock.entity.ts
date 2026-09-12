import { randomUUID } from "node:crypto";
import { CreditAmount } from "../../../shared-kernel/domain/credit-amount.vo";

export interface JobUnlockProps {
  id: string;
  workerId: string;
  jobPostingId: string;
  creditsSpent: CreditAmount;
  unlockedAt: Date;
}

// Registro imutável: uma vez criado, nunca é alterado (regra 27 — não há
// "devolução" de desbloqueio).
export class JobUnlock {
  private constructor(private readonly props: JobUnlockProps) {}

  static create(input: { workerId: string; jobPostingId: string; creditsSpent: CreditAmount }): JobUnlock {
    return new JobUnlock({
      id: randomUUID(),
      workerId: input.workerId,
      jobPostingId: input.jobPostingId,
      creditsSpent: input.creditsSpent,
      unlockedAt: new Date(),
    });
  }

  static restore(props: JobUnlockProps): JobUnlock {
    return new JobUnlock(props);
  }

  get id(): string {
    return this.props.id;
  }

  get workerId(): string {
    return this.props.workerId;
  }

  get jobPostingId(): string {
    return this.props.jobPostingId;
  }

  get creditsSpent(): CreditAmount {
    return this.props.creditsSpent;
  }

  get unlockedAt(): Date {
    return this.props.unlockedAt;
  }
}
