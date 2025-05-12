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

# Instalar pnpm globalmente en la etapa de producción para que el comando esté disponible
RUN npm install -g pnpm

# Copiar todos los archivos de la etapa builder a la etapa production, excepto node_modules y dist
COPY --from=builder /app/ ./
# Copiar solo los archivos necesarios para la ejecución en producción
# COPY --from=builder /app/dist ./dist  # Ya copiado con COPY /app/ ./
# COPY --from=builder /app/package.json ./package.json # Ya copiado con COPY /app/ ./
# COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml # Ya copiado con COPY /app/ ./
# COPY --from=builder /app/node_modules ./node_modules # Ya copiado con COPY /app/ ./
# COPY --from=builder /app/src ./src # Ya copiado con COPY /app/ ./
# COPY public ./public # Ya copiado con COPY /app/ ./
# Copiar el script de entrada
# COPY docker-entrypoint.sh ./docker-entrypoint.sh # Ya copiado con COPY /app/ ./

# Dar permisos de ejecución al script
RUN chmod +x ./docker-entrypoint.sh

ENV NODE_ENV=production

# Definir el script de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]
# El CMD ya no es necesario si usas ENTRYPOINT para iniciar la app
# CMD ["node", "bootstrap.js", "dist/main.js"]
