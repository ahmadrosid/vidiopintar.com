# 1. Install dependencies
FROM oven/bun:1-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 2. Builder
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG SQLITE_DATABASE_PATH=/data/vidiopintar.db
ARG DEEPSEEK_API_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG API_BASE_URL
ARG API_X_HEADER_API_KEY
ARG ADMIN_MASTER_EMAIL
ARG SUPADATA_API_KEY
ARG NODE_ENV=production

RUN echo "SQLITE_DATABASE_PATH=${SQLITE_DATABASE_PATH}" > .env && \
    echo "NODE_ENV=${NODE_ENV}" >> .env && \
    echo "DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}" >> .env && \
    echo "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}" >> .env && \
    echo "BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}" >> .env && \
    echo "BETTER_AUTH_URL=${BETTER_AUTH_URL}" >> .env && \
    echo "API_BASE_URL=${API_BASE_URL}" >> .env && \
    echo "API_X_HEADER_API_KEY=${API_X_HEADER_API_KEY}" >> .env && \
    echo "ADMIN_MASTER_EMAIL=${ADMIN_MASTER_EMAIL}" >> .env && \
    echo "SUPADATA_API_KEY=${SUPADATA_API_KEY}" >> .env

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# 3. Runner
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src/drizzle ./src/drizzle

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
