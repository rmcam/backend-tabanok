# Instrucciones para Desarrollo en Tabanok

---

## Requisitos

*   Node.js >= 18.19.0
*   pnpm install
*   Docker (opcional)

## Entorno de Desarrollo

*   **Backend:** `pnpm run --filter backend dev`
*   **Frontend:** `pnpm run --filter frontend dev` (acceder en http://localhost:3000)
    *   Asegúrate de que `VITE_API_URL` en `.env` sea `http://localhost:8000` si ejecutas el frontend localmente.
*   **Docker Compose:** `docker-compose up --build`
    *   Base de datos: localhost:5433 (SSL mode: disable, credenciales en .env)

## Testing

*   Ejecutar tests: `pnpm run test`
*   Cobertura: `pnpm run --filter backend test:cov`

## Linting y Formateo

*   Lint: `npm run lint`
*   Formatear: `npm exec prettier --write .`

## Buenas prácticas

*   Documentación en `docs/`.
*   Tests con buena cobertura.
*   Commits claros.
*   Actualizar dependencias.
*   Usar el paquete común.

## Variables de Entorno

Ver detalles en `docs/Codigos.md`.

## Migraciones

```bash
pnpm typeorm migration:run -d src/data-source.ts
```

---

Última actualización: 20/4/2025, 2:00:00 a. m. (America/Bogota, UTC-5:00)
