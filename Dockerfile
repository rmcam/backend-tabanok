# Etapa 1: build
FROM node:18 AS builder

WORKDIR /app

# Copiar los archivos de dependencias y configurar pnpm
COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml

# Instalar pnpm globalmente y luego las dependencias del proyecto
RUN echo 'allow-builds=true' > ~/.npmrc && npm install -g pnpm && pnpm install --no-frozen-lockfile

# Copiar el resto de los archivos necesarios para la construcción
COPY nest-cli.json ./nest-cli.json
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY src ./src
COPY public ./public

# Construir la aplicación NestJS
RUN pnpm build

# Etapa 2: producción
FROM node:18 AS production

WORKDIR /app

# Copiar solo los archivos necesarios para la ejecución en producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY public ./public
COPY bootstrap.js ./bootstrap.js

ENV NODE_ENV=production

CMD ["node", "bootstrap.js", "dist/main.js"]
