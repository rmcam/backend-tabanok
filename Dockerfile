# Etapa 1: build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar los archivos necesarios para la construcción desde el subdirectorio backend
COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY nest-cli.json ./nest-cli.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY src ./src

# Instalar dependencias usando pnpm
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# Construir la aplicación NestJS
RUN pnpm build

# Etapa 2: producción
FROM node:18-alpine AS production

WORKDIR /app

# Copiar solo los archivos necesarios para la ejecución en producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
