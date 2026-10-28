# Frontend Next.js (output standalone), construido y servido con Node.
# Se usa builder Dockerfile (como el backend) en vez de Railpack para evitar la
# ruta de build de Railway que venía fallando por su daemon buildkit.

FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# NEXT_PUBLIC_API_URL se hornea en el bundle en build time. Railway pasa las
# variables del servicio como build args; la declaramos como ARG para usarla.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Salida standalone: server mínimo + node_modules traceado. Los assets estáticos
# (.next/static) y public/ hay que copiarlos aparte (Next no los mete en standalone).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
