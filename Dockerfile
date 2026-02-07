# 1. Installer Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# 2. Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG DB_PASSWORD
ARG DB_USER
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG OPENAI_API_KEY
ARG GOOGLE_GENERATIVE_AI_API_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG API_BASE_URL
ARG API_X_HEADER_API_KEY

# Create .env file from build args
RUN echo "DB_PASSWORD=${DB_PASSWORD}" > .env && \
    echo "DB_USER=${DB_USER}" >> .env && \
    echo "DB_HOST=${DB_HOST}" >> .env && \
    echo "DB_PORT=${DB_PORT}" >> .env && \
    echo "DB_NAME=${DB_NAME}" >> .env && \
    echo "OPENAI_API_KEY=${OPENAI_API_KEY}" >> .env && \
    echo "GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY}" >> .env && \
    echo "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}" >> .env && \
    echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" >> .env && \
    echo "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" >> .env && \
    echo "BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}" >> .env && \
    echo "BETTER_AUTH_URL=${BETTER_AUTH_URL}" >> .env && \
    echo "API_BASE_URL=${API_BASE_URL}" >> .env && \
    echo "API_X_HEADER_API_KEY=${API_X_HEADER_API_KEY}" >> .env

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 3. Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
