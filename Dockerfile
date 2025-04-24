# Etapa 1: build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar lockfile, workspace y raíz del monorepo
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY package.json ./package.json
COPY packages ./packages

RUN npm install -g pnpm @nestjs/cli && pnpm install --no-frozen-lockfile

# Cambiar al backend
WORKDIR /app/backend

# Copiar backend
COPY backend/package.json ./package.json
COPY backend/src ./src
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/tsconfig.build.json ./tsconfig.build.json
COPY backend/nest-cli.json ./nest-cli.json
COPY backend/files ./files

RUN pnpm install --no-frozen-lockfile

# Copiar node_modules del backend a la raíz para producción
RUN cp -r node_modules /app/node_modules

RUN pnpm --filter backend build

# Etapa 2: producción
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/backend/files ./files
COPY --from=builder /app/backend/src ./src

RUN npm install -g pnpm && pnpm install --prod --filter backend --no-frozen-lockfile

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
