import { apiFetch } from "./client";

export type JobPostingStatus = "DRAFT" | "IN_MODERATION" | "PUBLISHED" | "REJECTED" | "CLOSED" | "EXPIRED";

export interface JobPostingPublicView {
  id: string;
  title: string;
  description: string;
  requirements: string;
  salaryRangeCents: { min: number; max: number };
  location: string;
  unlockCost: number;
  publishedAt: string | null;
  expiresAt: string | null;
}

export interface JobPostingInternalView extends JobPostingPublicView {
  companyId: string;
  status: JobPostingStatus;
  contactInfo: { email: string | null; phone: string | null; applicationUrl: string | null };
  rejectionReason: string | null;
  createdAt: string;
}

export interface JobPostingUnlockedView extends JobPostingPublicView {
  companyName: string;
  contactInfo: { email: string | null; phone: string | null; applicationUrl: string | null };
}

export interface JobPostingFormInput {
  title: string;
  description: string;
  requirements: string;
  salaryMinCents: number;
  salaryMaxCents: number;
  location: string;
  contactEmail?: string;
  contactPhone?: string;
  contactApplicationUrl?: string;
  unlockCost: number;
}

export function listPublicJobPostings(location?: string): Promise<JobPostingPublicView[]> {
  const query = location ? `?location=${encodeURIComponent(location)}` : "";
  return apiFetch(`/job-postings${query}`);
}

export function getJobPostingDetails(
  id: string,
  token?: string,
): Promise<JobPostingPublicView | JobPostingUnlockedView> {
  return apiFetch(`/job-postings/${id}`, { token });
}

export function listCompanyJobPostings(token: string): Promise<JobPostingInternalView[]> {
  return apiFetch("/companies/me/job-postings", { token });
}

export function createJobPosting(token: string, input: JobPostingFormInput): Promise<{ id: string }> {
  return apiFetch("/companies/me/job-postings", { method: "POST", token, body: input });
}

export function updateJobPostingDraft(token: string, id: string, input: JobPostingFormInput): Promise<void> {
  return apiFetch(`/companies/me/job-postings/${id}`, { method: "PATCH", token, body: input });
}

export function submitJobPostingForModeration(token: string, id: string): Promise<void> {
  return apiFetch(`/companies/me/job-postings/${id}/submit`, { method: "POST", token });
}

export function closeJobPosting(token: string, id: string): Promise<void> {
  return apiFetch(`/companies/me/job-postings/${id}/close`, { method: "POST", token });
}
