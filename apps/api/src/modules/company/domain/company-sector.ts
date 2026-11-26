import { ValidationError } from "../../../shared-kernel/domain/domain-error";

export class InvalidCompanySectorError extends ValidationError {}

export const COMPANY_SECTORS = [
  "METALURGIA",
  "ESTRUTURA_METALICA",
  "CALDEIRARIA",
  "SOLDAGEM",
  "USINAGEM",
  "FUNDICAO",
  "SERRALHERIA",
  "MANUTENCAO_INDUSTRIAL",
  "AUTOMACAO",
  "OUTROS",
] as const;

export type CompanySector = (typeof COMPANY_SECTORS)[number];

export function parseCompanySector(value: string): CompanySector {
  if (!(COMPANY_SECTORS as readonly string[]).includes(value)) {
    throw new InvalidCompanySectorError(`Setor inválido: ${value}`);
  }
  return value as CompanySector;
}
