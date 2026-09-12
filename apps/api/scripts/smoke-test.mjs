#!/usr/bin/env node
// Smoke test pós-deploy: uma checagem rasa de que a API está no ar e
// respondendo pelas rotas públicas essenciais. Não substitui os testes
// unitários (pnpm test) nem testa o fluxo de pagamento — só confirma que o
// processo subiu, conectou no banco e está servindo tráfego.
//
// Uso: BASE_URL=https://api.eteronhub.com node scripts/smoke-test.mjs
// (BASE_URL default: http://localhost:3000)

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const checks = [
  {
    name: "GET /health responde 200 com status ok",
    run: async () => {
      const response = await fetch(`${baseUrl}/health`);
      const body = await response.json();
      if (response.status !== 200 || body.status !== "ok") {
        throw new Error(`esperado 200/{status:"ok"}, recebido ${response.status} ${JSON.stringify(body)}`);
      }
    },
  },
  {
    name: "GET /credit-packages responde 200 com uma lista (confirma conexão com o banco)",
    run: async () => {
      const response = await fetch(`${baseUrl}/credit-packages`);
      const body = await response.json();
      if (response.status !== 200 || !Array.isArray(body)) {
        throw new Error(`esperado 200/array, recebido ${response.status} ${JSON.stringify(body)}`);
      }
    },
  },
  {
    name: "GET /job-postings responde 200 com uma lista",
    run: async () => {
      const response = await fetch(`${baseUrl}/job-postings`);
      const body = await response.json();
      if (response.status !== 200 || !Array.isArray(body)) {
        throw new Error(`esperado 200/array, recebido ${response.status} ${JSON.stringify(body)}`);
      }
    },
  },
  {
    name: "POST /auth/login com credenciais inválidas responde 401 (confirma o pipeline de autenticação)",
    run: async () => {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "WORKER", email: "smoke-test@example.com", password: "wrong-password" }),
      });
      if (response.status !== 401) {
        throw new Error(`esperado 401, recebido ${response.status}`);
      }
    },
  },
];

let failures = 0;

for (const check of checks) {
  try {
    await check.run();
    console.log(`✔ ${check.name}`);
  } catch (error) {
    failures += 1;
    console.error(`✘ ${check.name}`);
    console.error(`  ${error.message}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} de ${checks.length} checagem(ns) falharam contra ${baseUrl}`);
  process.exit(1);
}

console.log(`\nTodas as ${checks.length} checagens passaram contra ${baseUrl}`);
