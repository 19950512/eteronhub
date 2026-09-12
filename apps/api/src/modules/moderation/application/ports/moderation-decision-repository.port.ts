import { ModerationDecision } from "../../domain/moderation-decision.entity";

export interface ModerationDecisionRepository {
  save(decision: ModerationDecision): Promise<void>;
  findByJobPosting(jobPostingId: string): Promise<ModerationDecision[]>;
}
