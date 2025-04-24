# Usa una imagen base de Node.js con una versión LTS
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json (si existe) para instalar las dependencias
COPY package*.json ./

# Instala las dependencias.  Usa --production para optimizar el tamaño de la imagen.
RUN pnpm install --frozen-lockfile --production

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación NestJS.  Esto ejecutará el comando de construcción definido en package.json
RUN pnpm run build

# Expone el puerto en el que la aplicación escucha
EXPOSE 8000

# Comando para ejecutar la aplicación.  Asegúrate de que el comando sea correcto para tu aplicación.
CMD ["pnpm", "start:prod"]
