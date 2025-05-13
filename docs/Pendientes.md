# Pendientes del Proyecto Tabanok - Backend

---

Este documento lista las tareas pendientes y los próximos pasos planificados para el backend del proyecto Tabanok.

## Pendientes Clave (Backend)

*   **Testing:**
    - Mejorar la cobertura de tests en el backend. (Completado)
*   **Despliegue:**
    - Automatizar despliegues a producción (el pipeline CI/CD ya construye y sube imágenes, falta activar el paso SSH). (Configurado con Docker Hub y GitHub Actions)
*   **Planificación y Desarrollo de Nuevas Funcionalidades:**
    - **Funcionalidades Incompletas Identificadas (Backend):**
        - **Module:** Se ha creado la estructura básica del módulo (`module.module.ts`), controlador (`module.controller.ts`), servicio (`module.service.ts`) y entidad (`entities/module.entity.ts`), y se ha registrado en `AppModule`. La lógica del servicio para interactuar con la base de datos está implementada. (Completado)
*   **Refactorización y Limpieza:**
    - Revisar y eliminar redundancias y campos obsoletos restantes en el código y la base de datos. (Se han abordado algunas redundancias en el módulo de autenticación).
    - Revisar redundancias y eliminar campos obsoletos restantes en el módulo de gamificación.
*   **Módulo de Recomendaciones:**
    - ~~Corregir errores de TypeScript en `recommendations.service.ts` y `recommendations.controller.ts`~~
*   **Siembra de Base de Datos:**
    - [x] Completar la siembra detallada para todas las entidades en los seeders individuales, utilizando los datos disponibles en los directorios `files/json/` y `files/sql/`. Se han implementado seeders para las entidades principales (`User`, `Account`, `Module`, `Unity`, `Lesson`, `Topic`, `Activity`, `Content`, `ContentVersion`, `Comment`, `Exercise`, `Progress`, `Vocabulary`, `Reward`, `Achievement`, `Badge`, `MissionTemplate`, `Season`, y `SpecialEvent`) a través de seeders individuales ejecutados mediante el comando `pnpm seed`. **Se ha completado la implementación básica de seeders para las entidades restantes: `RevokedToken`, `BaseAchievement`, `CollaborationReward`, `Gamification`, `Leaderboard`, `MentorSpecialization`, `Mentor`, `MentorshipRelation`, `Mission`, `Streak`, `UserAchievement`, `UserBadge`, `UserMission`, `UserReward`, `ContentValidation`, `Notification`, `Tag` (anteriormente `StatisticsTag`), `WebhookSubscription`, `Multimedia`, `UserLevel`, `CulturalAchievement` y `AchievementProgress`.** [x] Extender esta siembra para proporcionar datos más completos y realistas en todos los seeders.
    - [x] Investigar y resolver el error `EntityMetadataNotFoundError: No metadata for "Comment" was found.` al ejecutar `pnpm run seed`. Este error ha sido resuelto.

## Próximos pasos recomendados (Resumen) (Backend)

1.  Mejorar cobertura de tests en backend.
2.  Automatizar despliegues a producción.
3.  Mantener la documentación y la hoja de ruta actualizadas tras cada cambio relevante.

---

Última actualización: 8/5/2025, 5:17 p. m. (America/Mexico_City, UTC-6:00)
