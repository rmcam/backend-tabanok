# Etapa 1: build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar los archivos necesarios para la construcción
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY src ./src
COPY scripts ./scripts
COPY public ./public
COPY docs ./docs
COPY .dockerignore ./
COPY .gitignore ./
COPY .gitattributes ./
COPY README.md ./
COPY jest.config.js ./
COPY nest ./nest
COPY backend@0.0.1 ./backend@0.0.1

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
