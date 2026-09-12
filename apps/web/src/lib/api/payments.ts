import { apiFetch } from "./client";

export interface CreditPackageView {
  id: string;
  name: string;
  priceCents: number;
  creditsAmount: number;
}

export type PaymentStatus = "PENDING" | "CONFIRMED" | "EXPIRED";

export interface CreatePixChargeOutput {
  paymentId: string;
  qrCode: string;
  qrCodeImageBase64: string;
  expiresAt: string;
}

export interface PaymentStatusOutput {
  id: string;
  status: PaymentStatus;
  amountCents: number;
  creditsAmount: number;
  expiresAt: string;
  confirmedAt: string | null;
}

export function listCreditPackages(): Promise<CreditPackageView[]> {
  return apiFetch("/credit-packages");
}

export function createPixCharge(token: string, creditPackageId: string): Promise<CreatePixChargeOutput> {
  return apiFetch("/workers/me/payments", { method: "POST", token, body: { creditPackageId } });
}

export function getPaymentStatus(token: string, paymentId: string): Promise<PaymentStatusOutput> {
  return apiFetch(`/workers/me/payments/${paymentId}`, { token });
}
