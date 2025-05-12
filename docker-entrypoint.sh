#!/bin/bash
# Script de entrada para Docker

# Ejecutar migraciones
echo "Running database migrations..."
pnpm run migration:run

# Verificar si las migraciones fueron exitosas
if [ $? -ne 0 ]; then
  echo "Database migrations failed!"
  exit 1
fi

echo "Database migrations completed successfully."

# Iniciar la aplicación
echo "Starting the application..."
exec pnpm start:prod