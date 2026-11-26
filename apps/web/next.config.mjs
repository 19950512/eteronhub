import process from "node:process";
import { URL, fileURLToPath } from "node:url";

// why: "standalone" gera um server.js com só as dependências usadas, para a
// imagem Docker não carregar o node_modules inteiro do monorepo. Só é ligado
// no build da imagem (NEXT_OUTPUT=standalone no Dockerfile) porque no Windows
// ele cria symlinks e falha com EPERM sem o modo desenvolvedor ativo.
const standalone = process.env.NEXT_OUTPUT === "standalone";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          // why: navegadores precisam buscar o SW novo a cada deploy; cache
          // longo prenderia usuários numa versão antiga do app.
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
  ...(standalone
    ? {
        output: "standalone",
        // why: o pnpm guarda os pacotes em node_modules/.pnpm na raiz do
        // monorepo, fora de apps/web; o tracing precisa partir de lá.
        outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
      }
    : {}),
};

export default nextConfig;
