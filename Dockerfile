# syntax=docker/dockerfile:1

# 1. Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Native build toolchain for better-sqlite3 on Alpine
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# 2. Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SQLITE_DATABASE_PATH=/data/vidiopintar.db
RUN --mount=type=cache,target=/app/.next/cache \
    npm exec next build

# 3. Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SQLITE_DATABASE_PATH=/data/vidiopintar.db

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /data && \
    chown nextjs:nodejs /data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src/drizzle ./src/drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts/mcp-key.mjs ./scripts/mcp-key.mjs

# better-sqlite3 is externalized; ensure native bindings are present in the runner
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/db/resolve-database-path.js ./src/lib/db/resolve-database-path.js

# Runtime migrations use drizzle-orm, already included in the standalone app.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm

COPY --from=builder --chown=nextjs:nodejs /app/scripts/migrate-sqlite.mjs ./scripts/migrate-sqlite.mjs
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

VOLUME ["/data"]

CMD ["/usr/local/bin/docker-entrypoint.sh"]
