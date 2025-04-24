# Códigos Utilizados

## Comandos para Ejecutar Migraciones

```bash
pnpm typeorm migration:run -d src/data-source.ts
```

## Variables de Entorno

Las variables de entorno se definen en el archivo `.env` y se utilizan para configurar la aplicación. Algunas de las variables de entorno más importantes son:

- `VITE_API_URL`: URL base de la API del backend.
- `DATABASE_URL`: URL de la base de datos PostgreSQL.
- `JWT_SECRET`: Secreto para la firma de tokens JWT.

Para obtener una lista completa de las variables de entorno, consulte la documentación del backend.

---

Última actualización: 20/4/2025, 2:00:00 a. m. (America/Bogota, UTC-5:00)
