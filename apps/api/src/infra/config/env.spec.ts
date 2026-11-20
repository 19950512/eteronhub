import { InvalidEnvironmentError, loadEnv, requireJwtSecret } from "./env";

const STRONG_SECRET = "a".repeat(48);
const PRODUCTION_BASE = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://x",
  JWT_SECRET: STRONG_SECRET,
  CORS_ORIGIN: "https://app.eteronhub.com",
};

function problemsOf(fn: () => unknown): string[] {
  try {
    fn();
  } catch (error) {
    if (error instanceof InvalidEnvironmentError) return error.problems;
    throw error;
  }
  return [];
}

describe("loadEnv", () => {
  it("aceita uma configuração de produção completa", () => {
    expect(loadEnv({ ...PRODUCTION_BASE, TRUST_PROXY_HOPS: "1" })).toEqual({
      port: 3000,
      jwtSecret: STRONG_SECRET,
      corsOrigins: ["https://app.eteronhub.com"],
      trustProxyHops: 1,
    });
  });

  it("recusa subir sem JWT_SECRET, mesmo fora de produção", () => {
    expect(problemsOf(() => loadEnv({ DATABASE_URL: "postgresql://x" }))).toContain(
      "JWT_SECRET não configurado",
    );
    expect(() => requireJwtSecret({})).toThrow(InvalidEnvironmentError);
  });

  it("em produção recusa segredos curtos", () => {
    expect(
      problemsOf(() => loadEnv({ ...PRODUCTION_BASE, JWT_SECRET: "curto" })),
    ).toContain("JWT_SECRET precisa ter ao menos 32 caracteres em produção");
  });

  it.each([{ NODE_ENV: "production" }, { NODE_ENV: undefined }, { NODE_ENV: "prod" }])(
    "recusa o segredo de exemplo mesmo com %p (deploy que esqueceu NODE_ENV)",
    (overrides) => {
      const problems = problemsOf(() =>
        loadEnv({
          ...PRODUCTION_BASE,
          ...overrides,
          JWT_SECRET: "change-me-in-production",
        }),
      );
      expect(problems).toContain("JWT_SECRET ainda é o valor de exemplo");
    },
  );

  it("fora de produção aceita segredo curto e usa o CORS de desenvolvimento", () => {
    const env = loadEnv({ DATABASE_URL: "postgresql://x", JWT_SECRET: "segredo-local" });
    expect(env.corsOrigins).toEqual(["http://localhost:3002"]);
    expect(env.trustProxyHops).toBe(0);
  });

  it.each([
    "*",
    "http://localhost:3002",
    "https://app.eteronhub.com,http://127.0.0.1:3000",
  ])("em produção recusa CORS_ORIGIN %p", (corsOrigin) => {
    expect(
      problemsOf(() => loadEnv({ ...PRODUCTION_BASE, CORS_ORIGIN: corsOrigin })),
    ).toContain("CORS_ORIGIN não pode conter '*' nem localhost em produção");
  });

  it("em produção exige CORS_ORIGIN e DATABASE_URL", () => {
    const problems = problemsOf(() =>
      loadEnv({ NODE_ENV: "production", JWT_SECRET: STRONG_SECRET }),
    );
    expect(problems).toEqual(
      expect.arrayContaining([
        "CORS_ORIGIN não configurado",
        "DATABASE_URL não configurada",
      ]),
    );
  });

  it("recusa TRUST_PROXY_HOPS inválido", () => {
    expect(
      problemsOf(() => loadEnv({ ...PRODUCTION_BASE, TRUST_PROXY_HOPS: "-1" })),
    ).toContain("TRUST_PROXY_HOPS inválido: -1");
  });
});
