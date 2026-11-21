# why: build a partir da raiz do monorepo (docker build -f apps/api/Dockerfile .)
# porque o lockfile e o tsconfig base ficam fora de apps/api.

FROM node:22-alpine AS base
# why: o engine do Prisma precisa de openssl no Alpine.
RUN apk add --no-cache openssl && corepack enable
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /repo

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/config/package.json packages/config/
COPY packages/shared-types/package.json packages/shared-types/
RUN pnpm install --frozen-lockfile --filter api...
COPY packages packages
COPY apps/api apps/api
RUN pnpm --filter api run prisma:generate \
 && pnpm --filter api run build \
 && pnpm --filter api deploy --prod --legacy /out \
 && cp -r apps/api/prisma /out/prisma
# why: o Prisma Client gerado no workspace não acompanha o `pnpm deploy`;
# precisa ser gerado de novo dentro do node_modules de produção.
RUN cd /out && ./node_modules/.bin/prisma generate --schema prisma/schema.prisma

FROM node:22-alpine AS runtime
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/package.json ./package.json
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/prisma ./prisma
COPY --from=build /repo/apps/api/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/health" > /dev/null || exit 1
# invariant: o container não aplica migrations ao subir — rode
# `./node_modules/.bin/prisma migrate deploy` como passo de release, antes de
# trocar as réplicas (ver docs/05-operacao-e-lancamento.md).
CMD ["node", "dist/main.js"]
