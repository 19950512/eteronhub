import { apiFetch } from "./client";

export interface WalletBalance {
  balance: number;
  updatedAt: string;
}

export function getWalletBalance(token: string): Promise<WalletBalance> {
  return apiFetch("/workers/me/credit-wallet", { token });
}
