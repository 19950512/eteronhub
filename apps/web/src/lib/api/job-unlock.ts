import { apiFetch } from "./client";

export interface UnlockJobPostingOutput {
  jobPostingId: string;
  creditsSpent: number;
  unlockedAt: string;
  alreadyUnlocked: boolean;
}

export interface JobUnlockHistoryItem {
  jobPostingId: string;
  jobPostingTitle: string | null;
  creditsSpent: number;
  unlockedAt: string;
}

export function unlockJobPosting(token: string, jobPostingId: string): Promise<UnlockJobPostingOutput> {
  return apiFetch(`/workers/me/job-postings/${jobPostingId}/unlock`, { method: "POST", token });
}

export function listWorkerJobUnlocks(token: string): Promise<JobUnlockHistoryItem[]> {
  return apiFetch("/workers/me/job-unlocks", { token });
}
