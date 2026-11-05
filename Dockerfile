# syntax=docker/dockerfile:1

# ---------- Build del frontend (React + Vite) ----------
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- Dependencias de producción del backend ----------
FROM node:22-bookworm-slim AS backend-deps
WORKDIR /app/backend
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./
RUN npm ci --omit=dev

# ---------- Imagen final ----------
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/backend

COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# /data se monta como volumen en docker-compose para SQLite y uploads.
RUN mkdir -p /data && chown -R node:node /app /data
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
