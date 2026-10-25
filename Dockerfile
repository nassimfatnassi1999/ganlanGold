# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS migration
COPY . .
RUN DATABASE_URL="postgresql://prisma-generate@localhost/prisma-generate" npx prisma generate \
  && chmod +x scripts/entrypoint.sh scripts/backup.sh scripts/restore.sh
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["migrate"]

FROM dependencies AS builder
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN DATABASE_URL="postgresql://prisma-generate@localhost/prisma-generate" npx prisma generate \
  && npm run build

FROM postgres:17-alpine AS operations
COPY --chmod=755 scripts/backup.sh scripts/restore.sh /usr/local/bin/

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  HOSTNAME=0.0.0.0 \
  PORT=3000
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts/entrypoint.sh ./scripts/entrypoint.sh
RUN chmod +x /app/scripts/entrypoint.sh
USER nextjs
EXPOSE 3000
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["app"]
