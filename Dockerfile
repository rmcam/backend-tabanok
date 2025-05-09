# Etapa 1: build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar lockfile, workspace y raíz del monorepo
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY package.json ./package.json
RUN npm install -g pnpm @nestjs/cli && pnpm install --no-frozen-lockfile

# Cambiar al backend
WORKDIR /app/backend

# Copiar backend
COPY ../package.json ./package.json
COPY ../src ./src
COPY ../tsconfig.json ./tsconfig.json
COPY ../tsconfig.build.json ./tsconfig.build.json
COPY ../nest-cli.json ./nest-cli.json
COPY ../src/database/files ./files

RUN pnpm install --no-frozen-lockfile

# Copiar node_modules del backend a la raíz para producción
RUN cp -r node_modules /app/node_modules

RUN pnpm --filter backend build

# Etapa 2: producción
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/backend/files ./files
COPY --from=builder /app/src ./src

RUN npm install -g pnpm && pnpm install --prod --filter backend --no-frozen-lockfile

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
