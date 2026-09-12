import { randomUUID } from "node:crypto";

export type ModerationDecisionType = "APPROVED" | "REJECTED";

export interface ModerationDecisionProps {
  id: string;
  jobPostingId: string;
  adminId: string;
  decision: ModerationDecisionType;
  reason: string | null;
  decidedAt: Date;
}

export class ModerationDecision {
  private constructor(private readonly props: ModerationDecisionProps) {}

  static approve(input: { jobPostingId: string; adminId: string }): ModerationDecision {
    return new ModerationDecision({
      id: randomUUID(),
      jobPostingId: input.jobPostingId,
      adminId: input.adminId,
      decision: "APPROVED",
      reason: null,
      decidedAt: new Date(),
    });
  }

  static reject(input: { jobPostingId: string; adminId: string; reason: string }): ModerationDecision {
    return new ModerationDecision({
      id: randomUUID(),
      jobPostingId: input.jobPostingId,
      adminId: input.adminId,
      decision: "REJECTED",
      reason: input.reason,
      decidedAt: new Date(),
    });
  }

  static restore(props: ModerationDecisionProps): ModerationDecision {
    return new ModerationDecision(props);
  }

  get id(): string {
    return this.props.id;
  }

  get jobPostingId(): string {
    return this.props.jobPostingId;
  }

  get adminId(): string {
    return this.props.adminId;
  }

  get decision(): ModerationDecisionType {
    return this.props.decision;
  }

  get reason(): string | null {
    return this.props.reason;
  }

  get decidedAt(): Date {
    return this.props.decidedAt;
  }
}
