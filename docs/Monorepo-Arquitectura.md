# Arquitectura del Monorepo Tabanok

---

## Estructura general

```
/
├── backend/          # API REST con NestJS
├── frontend/         # Aplicación React + Vite
├── packages/common/  # Tipos y utilidades compartidas
├── docs/             # Documentación centralizada
├── package.json      # Dependencias y scripts comunes
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Flujo general

- **Frontend** consume la API del **backend**.
- **Backend** se conecta a la base de datos PostgreSQL.
- **Paquete común** comparte tipos TypeScript y utilidades entre backend y frontend.
- **Docker Compose** levanta base de datos, backend y frontend.

---

## Tecnologías principales

- **Backend:** NestJS, TypeORM, PostgreSQL, JWT, Docker
- **Frontend:** React + Vite, TailwindCSS
- **Monorepo:** pnpm workspaces
- **Testing:** Jest, Testing Library
- **Linting/Formateo:** ESLint, Prettier
- **Internacionalización:** react-i18next
- **Validación:** Zod

---

Ver pendientes y mejoras futuras en [`docs/Pendientes.md`](./Pendientes.md).

---

Última actualización: 23/4/2025, 3:16 p. m. (America/Bogota, UTC-5:00)
