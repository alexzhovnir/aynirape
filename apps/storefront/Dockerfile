# Build context is the monorepo root: docker build -f apps/storefront/Dockerfile .
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS build
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/storefront/package.json apps/storefront/package.json
RUN pnpm install --frozen-lockfile --filter storefront...
COPY apps/storefront apps/storefront

ARG PUBLIC_MEDUSA_BACKEND_URL
ARG PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG DEFAULT_REGION
ARG PUBLIC_SITE_URL
ARG PUBLIC_STRIPE_KEY
ARG S3_DOMAIN
ARG PUBLIC_PAYPAL_CLIENT_ID
ENV PUBLIC_MEDUSA_BACKEND_URL=$PUBLIC_MEDUSA_BACKEND_URL \
    PUBLIC_MEDUSA_PUBLISHABLE_KEY=$PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    DEFAULT_REGION=$DEFAULT_REGION \
    PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_STRIPE_KEY=$PUBLIC_STRIPE_KEY \
    S3_DOMAIN=$S3_DOMAIN \
    PUBLIC_PAYPAL_CLIENT_ID=$PUBLIC_PAYPAL_CLIENT_ID

WORKDIR /repo/apps/storefront
RUN pnpm build

# Deploy isolated production bundle with standalone node_modules
RUN pnpm --filter storefront deploy --prod /prod/storefront

FROM node:22-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /prod/storefront ./
EXPOSE 8100
ENV HOST=0.0.0.0
ENV PORT=8100
CMD ["node", "./dist/server/entry.mjs"]
