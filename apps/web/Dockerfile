# why: build a partir da raiz do monorepo (docker build -f apps/web/Dockerfile .)
# porque o lockfile e o tsconfig base ficam fora de apps/web.

FROM node:22-alpine AS base
RUN corepack enable
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1
WORKDIR /repo

FROM base AS build
# hazard: NEXT_PUBLIC_* é embutido no bundle durante o build, não lido em
# runtime — cada ambiente (homologação/produção) precisa da própria imagem.
ARG NEXT_PUBLIC_API_URL
RUN test -n "$NEXT_PUBLIC_API_URL" \
 || (echo "Passe --build-arg NEXT_PUBLIC_API_URL=https://api.seu-dominio" >&2 && exit 1)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_OUTPUT=standalone
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/shared-types/package.json packages/shared-types/
RUN pnpm install --frozen-lockfile --filter web...
COPY packages packages
COPY apps/web apps/web
RUN pnpm --filter web run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3002
WORKDIR /app
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/" > /dev/null || exit 1
CMD ["node", "apps/web/server.js"]
