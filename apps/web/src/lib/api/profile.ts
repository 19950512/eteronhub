import { apiFetch } from "./client";

export interface WorkerSoftware {
  name: string;
  version: string | null;
}

export interface WorkerProfile {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  phone: string | null;
  bio: string | null;
  segments: string[];
  softwares: WorkerSoftware[];
  createdAt: string;
}

export interface WorkerProfileInput {
  phone: string | null;
  bio: string | null;
  segments: string[];
  softwares: WorkerSoftware[];
}

export interface CompanyProfile {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  email: string;
  sector: string | null;
  city: string | null;
  state: string | null;
  whatsapp: string | null;
  website: string | null;
  createdAt: string;
}

export interface CompanyProfileInput {
  nomeFantasia: string | null;
  sector: string | null;
  city: string | null;
  state: string | null;
  whatsapp: string | null;
  website: string | null;
}

export function getWorkerProfile(token: string): Promise<WorkerProfile> {
  return apiFetch("/workers/me/profile", { token });
}

export function updateWorkerProfile(
  token: string,
  input: WorkerProfileInput,
): Promise<WorkerProfile> {
  return apiFetch("/workers/me/profile", { method: "PUT", token, body: input });
}

export function getCompanyProfile(token: string): Promise<CompanyProfile> {
  return apiFetch("/companies/me/profile", { token });
}

export function updateCompanyProfile(
  token: string,
  input: CompanyProfileInput,
): Promise<CompanyProfile> {
  return apiFetch("/companies/me/profile", { method: "PUT", token, body: input });
}
