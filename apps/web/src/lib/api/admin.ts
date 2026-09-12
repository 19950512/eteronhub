import { apiFetch } from "./client";
import { JobPostingInternalView } from "./job-postings";

export function getAdminProfile(token: string): Promise<{ id: string; name: string; email: string }> {
  return apiFetch("/admin/me", { token });
}

export function listPendingModeration(token: string): Promise<JobPostingInternalView[]> {
  return apiFetch("/admin/moderation/pending", { token });
}

export function approveJobPosting(token: string, jobPostingId: string): Promise<void> {
  return apiFetch(`/admin/moderation/${jobPostingId}/approve`, { method: "POST", token });
}

export function rejectJobPosting(token: string, jobPostingId: string, reason: string): Promise<void> {
  return apiFetch(`/admin/moderation/${jobPostingId}/reject`, { method: "POST", token, body: { reason } });
}

export function suspendCompany(token: string, companyId: string): Promise<void> {
  return apiFetch(`/admin/companies/${companyId}/suspend`, { method: "POST", token });
}

export function reactivateCompany(token: string, companyId: string): Promise<void> {
  return apiFetch(`/admin/companies/${companyId}/reactivate`, { method: "POST", token });
}

export function suspendWorker(token: string, workerId: string): Promise<void> {
  return apiFetch(`/admin/workers/${workerId}/suspend`, { method: "POST", token });
}

export function reactivateWorker(token: string, workerId: string): Promise<void> {
  return apiFetch(`/admin/workers/${workerId}/reactivate`, { method: "POST", token });
}
