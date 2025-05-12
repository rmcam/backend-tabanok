# Códigos y Configuraciones Clave

---

Este documento recopila comandos importantes y detalles sobre las variables de entorno utilizadas en los proyectos frontend y backend de Tabanok.

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

## Variables de Entorno

Las variables de entorno se definen en el archivo `.env` en los directorios raíz de cada proyecto (`frontend-tabanok/.env` y `backend-tabanok/.env`) y se utilizan para configurar la aplicación en diferentes entornos (desarrollo, producción, etc.).

Algunas de las variables de entorno más importantes incluyen:

*   `VITE_API_URL`: URL base de la API del backend a la que el frontend debe conectarse. (Definida en `frontend-tabanok/.env`)
*   `DATABASE_URL`: URL de conexión completa para la base de datos PostgreSQL. (Definida en `backend-tabanok/.env`)
*   `JWT_SECRET`: Secreto utilizado para la firma y verificación de tokens JWT en el backend. (Definida en `backend-tabanok/.env`)
*   `PORT`: Puerto en el que el backend escucha las conexiones entrantes. (Definida en `backend-tabanok/.env`)
*   `ALLOWED_ORIGINS`: Orígenes permitidos para las solicitudes CORS en el backend (separados por coma). (Definida en `backend-tabanok/.env`)
*   `RATE_LIMIT_MAX`: Límite máximo de peticiones por IP para la protección de tasa en el backend. (Definida en `backend-tabanok/.env`)
*   `NODE_ENV`: Entorno de ejecución ('development', 'production', etc.). (Definida en `backend-tabanok/.env`)
*   Variables relacionadas con el almacenamiento en la nube (AWS S3): `STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`. (Definidas en `backend-tabanok/.env`)
*   Variables relacionadas con Docker Hub para la construcción de imágenes: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`. (Definidas en `frontend-tabanok/.env` y `backend-tabanok/.env`)

Para obtener una lista completa de las variables de entorno disponibles y su descripción, consulte los archivos `.env.example` en los directorios raíz de cada proyecto.

---

Última actualización: 7/5/2025, 12:34 a. m. (America/Bogota, UTC-5:00)
