# Build context is the monorepo root: docker build -f apps/backend/Dockerfile .
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS build
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter backend...

COPY apps/backend apps/backend
WORKDIR /repo/apps/backend
RUN pnpm build

# Deploy isolated production bundle with standalone node_modules
WORKDIR /repo
RUN pnpm --filter backend deploy --prod /prod/backend

FROM node:22-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/backend/.medusa/server ./
COPY --from=build /prod/backend/node_modules ./node_modules

EXPOSE 9000
CMD ["npx", "medusa", "start"]
