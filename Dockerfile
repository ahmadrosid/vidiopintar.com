# 1. Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Native build toolchain for better-sqlite3 on Alpine
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# 2. Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SQLITE_DATABASE_PATH=/data/vidiopintar.db
RUN npm exec next build

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

# better-sqlite3 is externalized; ensure native bindings are present in the runner
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Drizzle migration tooling (docker exec <container> npm run db:migrate)
COPY --from=builder /app/drizzle.config.js ./
COPY --from=builder /app/src/lib/db/schema ./src/lib/db/schema
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-kit ./node_modules/drizzle-kit
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@drizzle-team ./node_modules/@drizzle-team
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@esbuild-kit ./node_modules/@esbuild-kit
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@esbuild ./node_modules/@esbuild
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/esbuild-register ./node_modules/esbuild-register
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/get-tsconfig ./node_modules/get-tsconfig
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/resolve-pkg-maps ./node_modules/resolve-pkg-maps
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/source-map-support ./node_modules/source-map-support
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/source-map ./node_modules/source-map
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/buffer-from ./node_modules/buffer-from
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/debug ./node_modules/debug
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/ms ./node_modules/ms
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.bin/drizzle-kit ./node_modules/.bin/drizzle-kit
RUN printf '#!/bin/sh\nexec node /app/node_modules/drizzle-kit/bin.cjs "$@"\n' > /usr/local/bin/drizzle-kit && \
    chmod +x /usr/local/bin/drizzle-kit

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

VOLUME ["/data"]

CMD ["node", "server.js"]
