import { apiFetch } from "./client";

export interface RegisterCompanyInput {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  email: string;
  password: string;
}

export interface RegisterWorkerInput {
  cpf: string;
  nome: string;
  email: string;
  password: string;
}

export function registerCompany(input: RegisterCompanyInput): Promise<{ id: string }> {
  return apiFetch("/companies", { method: "POST", body: input });
}

export function registerWorker(input: RegisterWorkerInput): Promise<{ id: string }> {
  return apiFetch("/workers", { method: "POST", body: input });
}

export function login(input: {
  role: "COMPANY" | "WORKER";
  email: string;
  password: string;
}): Promise<{ accessToken: string }> {
  return apiFetch("/auth/login", { method: "POST", body: input });
}

export function loginAdmin(input: { email: string; password: string }): Promise<{ accessToken: string }> {
  return apiFetch("/admin/auth/login", { method: "POST", body: input });
}
