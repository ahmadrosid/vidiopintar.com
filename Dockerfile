# Stage 1: Install dependencies
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Stage 2: Build the Next.js application
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# Stage 3: Production image
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV production
# ENV PORT 3000 # Next.js default is 3000

# Better Auth environment variables
ENV BETTER_AUTH_SECRET="your-better-auth-secret-replace-in-production"
ENV BETTER_AUTH_URL="https://your-production-url.com"
ENV NEXT_PUBLIC_SITE_URL="https://your-production-url.com"

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
