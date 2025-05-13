# Códigos y Configuraciones Clave - Backend

---

Este documento recopila comandos importantes y detalles sobre las variables de entorno utilizadas en el proyecto backend de Tabanok.

## Comandos para Ejecutar Migraciones (Backend)

Para aplicar las migraciones de la base de datos definidas en el backend, navegue al directorio del backend (`backend-tabanok/`) y utilice el siguiente comando:

```bash
pnpm typeorm migration:run -d src/data-source.ts
```

Este comando ejecutará todas las migraciones pendientes utilizando la configuración especificada en `src/data-source.ts`.

## Comandos para Ejecutar Seeders (Backend)

Para poblar la base de datos con datos iniciales utilizando los seeders, navegue al directorio del backend (`backend-tabanok/`) y utilice el siguiente comando:

```bash
pnpm seed
```

Este comando ejecutará todos los seeders configurados en el proyecto.

## Variables de Entorno (Backend)

Las variables de entorno se definen en el archivo `.env` en el directorio raíz del backend (`backend-tabanok/.env`) y se utilizan para configurar la aplicación en diferentes entornos (desarrollo, producción, etc.).

Algunas de las variables de entorno más importantes incluyen:

*   `DATABASE_URL`: URL de conexión completa para la base de datos PostgreSQL.
*   `JWT_SECRET`: Secreto utilizado para la firma y verificación de tokens JWT en el backend.
*   `PORT`: Puerto en el que el backend escucha las conexiones entrantes.
*   `ALLOWED_ORIGINS`: Orígenes permitidos para las solicitudes CORS en el backend (separados por coma).
*   `RATE_LIMIT_MAX`: Límite máximo de peticiones por IP para la protección de tasa en el backend.
*   `NODE_ENV`: Entorno de ejecución ('development', 'production', etc.).
*   Variables relacionadas con el almacenamiento en la nube (AWS S3): `STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`.
*   Variables relacionadas con Docker Hub para la construcción de imágenes: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

Para obtener una lista completa de las variables de entorno disponibles y su descripción, consulte el archivo `.env.example` en el directorio raíz del backend.

---

Última actualización: 7/5/2025, 12:34 a. m. (America/Bogota, UTC-5:00)
