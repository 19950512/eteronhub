import { ValidationError } from "../../../shared-kernel/domain/domain-error";

export class InvalidWorkerSegmentError extends ValidationError {}

export const WORKER_SEGMENTS = [
  "TORRES",
  "GALPOES",
  "ESTRUTURAS_RESIDENCIAIS",
  "ESTRUTURAS_COMERCIAIS",
  "ESTRUTURAS_INDUSTRIAIS",
  "PONTES_VIADUTOS",
  "PLATAFORMAS",
  "ESCADAS_CORRIMAOS",
  "PORTOES_GRADES",
  "COBERTURA_METALICA",
  "MEZANINO",
  "TUBULACAO",
  "CALDEIRARIA",
  "MONTAGEM_INDUSTRIAL",
  "MANUTENCAO_INDUSTRIAL",
  "OUTRO",
] as const;

export type WorkerSegment = (typeof WORKER_SEGMENTS)[number];

export function parseWorkerSegment(value: string): WorkerSegment {
  if (!(WORKER_SEGMENTS as readonly string[]).includes(value)) {
    throw new InvalidWorkerSegmentError(`Segmento de atuação inválido: ${value}`);
  }
  return value as WorkerSegment;
}
