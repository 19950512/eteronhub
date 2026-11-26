import { apiFetch } from "./client";

export function exportMyData(token: string): Promise<unknown> {
  return apiFetch("/me/privacy/export", { token });
}

export function deleteMyAccount(token: string, password: string): Promise<void> {
  return apiFetch("/me/privacy/account-deletion", {
    method: "POST",
    token,
    body: { password },
  });
}
