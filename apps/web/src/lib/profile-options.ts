// invariant: os códigos espelham os enums WorkerSegment e CompanySector do
// Prisma (apps/api) — a API rejeita qualquer código fora dessas listas.
export const WORKER_SEGMENT_LABELS: Record<string, string> = {
  TORRES: "Torres",
  GALPOES: "Galpões",
  ESTRUTURAS_RESIDENCIAIS: "Estruturas residenciais",
  ESTRUTURAS_COMERCIAIS: "Estruturas comerciais",
  ESTRUTURAS_INDUSTRIAIS: "Estruturas industriais",
  PONTES_VIADUTOS: "Pontes e viadutos",
  PLATAFORMAS: "Plataformas",
  ESCADAS_CORRIMAOS: "Escadas e corrimãos",
  PORTOES_GRADES: "Portões e grades",
  COBERTURA_METALICA: "Cobertura metálica",
  MEZANINO: "Mezanino",
  TUBULACAO: "Tubulação",
  CALDEIRARIA: "Caldeiraria",
  MONTAGEM_INDUSTRIAL: "Montagem industrial",
  MANUTENCAO_INDUSTRIAL: "Manutenção industrial",
  OUTRO: "Outro",
};

export const WORKER_MAX_SEGMENTS = 10;
export const WORKER_MAX_SOFTWARES = 20;
export const WORKER_BIO_MAX_LENGTH = 2000;

export const COMPANY_SECTOR_LABELS: Record<string, string> = {
  METALURGIA: "Metalurgia",
  ESTRUTURA_METALICA: "Estrutura metálica",
  CALDEIRARIA: "Caldeiraria",
  SOLDAGEM: "Soldagem",
  USINAGEM: "Usinagem",
  FUNDICAO: "Fundição",
  SERRALHERIA: "Serralheria",
  MANUTENCAO_INDUSTRIAL: "Manutenção industrial",
  AUTOMACAO: "Automação",
  OUTROS: "Outros",
};

export const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
];
