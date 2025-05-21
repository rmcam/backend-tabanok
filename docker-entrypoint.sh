#!/bin/bash
# Script de entrada para Docker

# Iniciar la aplicación
echo "Starting the application..."
exec node dist/main.js
