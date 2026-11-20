const KNOWN_PLACEHOLDER_SECRETS = new Set([
  "change-me-in-production",
  "dev-secret-change-me",
]);
const MIN_PRODUCTION_SECRET_LENGTH = 32;
const DEV_CORS_ORIGIN = "http://localhost:3002";

export interface AppEnv {
  port: number;
  jwtSecret: string;
  corsOrigins: string[];
  trustProxyHops: number;
}

type EnvSource = Record<string, string | undefined>;

export class InvalidEnvironmentError extends Error {
  constructor(readonly problems: string[]) {
    super(`Configuração de ambiente inválida:\n- ${problems.join("\n- ")}`);
    this.name = "InvalidEnvironmentError";
  }
}

function isProduction(source: EnvSource): boolean {
  return source.NODE_ENV === "production";
}

function jwtSecretProblems(source: EnvSource): string[] {
  const secret = source.JWT_SECRET;
  if (!secret) {
    return ["JWT_SECRET não configurado"];
  }
  // why: o valor de exemplo é público; recusá-lo só com NODE_ENV=production
  // deixaria um deploy que esqueceu NODE_ENV aceitando token de ADMIN forjado.
  if (KNOWN_PLACEHOLDER_SECRETS.has(secret)) {
    return ["JWT_SECRET ainda é o valor de exemplo"];
  }
  if (!isProduction(source)) {
    return [];
  }
  const problems: string[] = [];
  if (secret.length < MIN_PRODUCTION_SECRET_LENGTH) {
    problems.push(
      `JWT_SECRET precisa ter ao menos ${MIN_PRODUCTION_SECRET_LENGTH} caracteres em produção`,
    );
  }
  return problems;
}

// invariant: nunca há segredo de JWT padrão — sem JWT_SECRET a API não sobe,
// porque um segredo conhecido permite forjar token de ADMIN.
export function requireJwtSecret(source: EnvSource = process.env): string {
  const problems = jwtSecretProblems(source);
  if (problems.length > 0) {
    throw new InvalidEnvironmentError(problems);
  }
  return source.JWT_SECRET as string;
}

export function loadEnv(source: EnvSource = process.env): AppEnv {
  const problems: string[] = [];

  if (!source.DATABASE_URL) {
    problems.push("DATABASE_URL não configurada");
  }
  problems.push(...jwtSecretProblems(source));

  const corsOrigins = (
    source.CORS_ORIGIN ?? (isProduction(source) ? "" : DEV_CORS_ORIGIN)
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (isProduction(source)) {
    if (corsOrigins.length === 0) {
      problems.push("CORS_ORIGIN não configurado");
    }
    if (
      corsOrigins.some(
        (origin) => origin === "*" || /\/\/(localhost|127\.0\.0\.1)(:|$)/.test(origin),
      )
    ) {
      problems.push("CORS_ORIGIN não pode conter '*' nem localhost em produção");
    }
  }

  const port = Number(source.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    problems.push(`PORT inválida: ${source.PORT}`);
  }

  const trustProxyHops = Number(source.TRUST_PROXY_HOPS ?? 0);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
    problems.push(`TRUST_PROXY_HOPS inválido: ${source.TRUST_PROXY_HOPS}`);
  }

  if (problems.length > 0) {
    throw new InvalidEnvironmentError(problems);
  }

  return { port, jwtSecret: source.JWT_SECRET as string, corsOrigins, trustProxyHops };
}
