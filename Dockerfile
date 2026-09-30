# Imagen de producción de la app (Next.js, salida "standalone").
# Build: docker build -t ing-software .
# Run:   docker run -p 3000:3000 --env-file .env.local ing-software

# ---- deps: instala dependencias con el lockfile ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compila la app ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner: imagen final, solo lo necesario para correr ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Sin esto, el server standalone de Next.js hereda el HOSTNAME que Docker
# asigna al contenedor y solo escucha en esa interfaz interna, no en todas.
ENV HOSTNAME=0.0.0.0

# Usuario sin privilegios (no root) para ejecutar el servidor.
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
