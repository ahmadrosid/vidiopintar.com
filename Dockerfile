# 1. Installer Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# 2. Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG SQLITE_DATABASE_PATH=/data/vidiopintar.db
ARG OPENAI_API_KEY
ARG GOOGLE_GENERATIVE_AI_API_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG API_BASE_URL
ARG API_X_HEADER_API_KEY
ARG ADMIN_MASTER_EMAIL
ARG SUPADATA_API_KEY
ARG NODE_ENV=production

RUN echo "SQLITE_DATABASE_PATH=${SQLITE_DATABASE_PATH}" > .env && \
    echo "NODE_ENV=${NODE_ENV}" >> .env && \
    echo "OPENAI_API_KEY=${OPENAI_API_KEY}" >> .env && \
    echo "GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY}" >> .env && \
    echo "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}" >> .env && \
    echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" >> .env && \
    echo "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" >> .env && \
    echo "BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}" >> .env && \
    echo "BETTER_AUTH_URL=${BETTER_AUTH_URL}" >> .env && \
    echo "API_BASE_URL=${API_BASE_URL}" >> .env && \
    echo "API_X_HEADER_API_KEY=${API_X_HEADER_API_KEY}" >> .env && \
    echo "ADMIN_MASTER_EMAIL=${ADMIN_MASTER_EMAIL}" >> .env && \
    echo "SUPADATA_API_KEY=${SUPADATA_API_KEY}" >> .env

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src/drizzle ./src/drizzle

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
