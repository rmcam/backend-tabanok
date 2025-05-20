# Pendientes del Proyecto Tabanok - Backend

---

Este documento lista las tareas pendientes y los prรณximos pasos planificados para el backend del proyecto Tabanok.

## Pendientes Clave (Backend)

*   **Testing:**
    - Mejorar la cobertura de tests en el backend.
    - Los tests unitarios para `auth.service.spec.ts` han sido corregidos y ahora pasan. Se ha implementado la verificaciรณn de tokens de refresco revocados. Se han aรฑadido pruebas para el guard `JwtAuthGuard` y ahora prioriza el token del header sobre el de las cookies.
*   **Despliegue:**
    - Automatizar despliegues a producciรณn (el pipeline CI/CD ya construye y sube imรกgenes, falta activar el paso SSH). (Configurado con Docker Hub y GitHub Actions)
*   **Planificaciรณn y Desarrollo de Nuevas Funcionalidades:**
    - **Funcionalidades Incompletas Identificadas (Backend):**
        - **Module:** Se ha creado la estructura bรกsica del mรณdulo (`module.module.ts`), controlador (`module.controller.ts`), servicio (`module.service.ts`) y entidad (`entities/module.entity.ts`), y se ha registrado en `AppModule`. La lรณgica del servicio para interactuar con la base de datos estรก implementada. (Completado)
*   **Refactorizaciรณn y Limpieza:**
    - Revisar y eliminar redundancias y campos obsoletos restantes en el cรณdigo y la base de datos. (Se han abordado algunas redundancias en el mรณdulo de autenticaciรณn).
    - Revisar redundancias y eliminar campos obsoletos restantes en el mรณdulo de gamificaciรณn.
*   **Mรณdulo de Recomendaciones:**
    - ~~Corregir errores de TypeScript en `recommendations.service.ts` y `recommendations.controller.ts`~~
*   **Siembra de Base de Datos:**
    - [x] Completar la siembra detallada para todas las entidades en los seeders individuales, utilizando los datos disponibles en los directorios `files/json/` y `files/sql/`. Se han implementado seeders para las entidades principales (`User`, `Account`, `Module`, `Unity`, `Lesson`, `Topic`, `Activity`, `Content`, `ContentVersion`, `Comment`, `Exercise`, `Progress`, `Vocabulary`, `Reward`, `Achievement`, `Badge`, `MissionTemplate`, `Season`, y `SpecialEvent`) a travรฉs de seeders individuales ejecutados mediante el comando `pnpm seed`. **Se ha completado la implementaciรณn bรกsica de seeders para las entidades restantes: `RevokedToken`, `BaseAchievement`, `CollaborationReward`, `Gamification`, `Leaderboard`, `MentorSpecialization`, `Mentor`, `MentorshipRelation`, `Mission`, `Streak`, `UserAchievement`, `UserBadge`, `UserMission`, `UserReward`, `ContentValidation`, `Notification`, `Tag` (anteriormente `StatisticsTag`), `WebhookSubscription`, `Multimedia`, `UserLevel`, `CulturalAchievement` y `AchievementProgress`.** [x] Extender esta siembra para proporcionar datos mรกs completos y realistas en todos los seeders.
    - [x] Investigar y resolver el error `EntityMetadataNotFoundError: No metadata for "Comment" was found.` al ejecutar `pnpm run seed`. Este error ha sido resuelto.

## Prรณximos pasos recomendados (Resumen) (Backend)

1.  Mejorar cobertura de tests en backend.
2.  Automatizar despliegues a producciรณn.
3.  Mantener la documentaciรณn y la hoja de ruta actualizadas tras cada cambio relevante.

---

รltima actualizaciรณn: 20/5/2025, 4:54 p.ยm. (America/Bogota, UTC-5:00)
