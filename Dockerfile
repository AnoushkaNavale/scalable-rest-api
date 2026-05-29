# Dockerfile
# Multi-stage build: keeps the final image small (no devDeps, no build tools)

# ── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Final image ─────────────────────────────────────────────────────
FROM node:20-alpine AS final
WORKDIR /app

RUN apk add --no-cache openssl

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create required directories with correct ownership
RUN mkdir -p uploads logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Health check for Docker / orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/v1/health || exit 1

CMD ["node", "src/server.js"]
