## Estado Actual del Proyecto Tabanok - Backend

---

Este documento resume el estado actual de desarrollo del backend de Tabanok, destacando las funcionalidades implementadas, las mejoras recientes y los pendientes clave.

### Estado del Backend

El backend es una aplicación **NestJS** conectada a **PostgreSQL**. Reside en su propio repositorio de Git: `https://github.com/rmcam/backend-tabanok`.

*   **Base de Datos:** Migración a PostgreSQL completada, relaciones corregidas y carga de datos iniciales implementada. Se resolvieron problemas de conexión y ciclos de dependencia en migraciones. La entidad `Comment` ha sido añadida a la configuración de TypeORM en `src/data-source.ts` para asegurar la detección de metadatos. **La siembra detallada de datos para todas las entidades principales se ha completado y mejorado significativamente a través de seeders individuales ejecutados mediante el comando `pnpm seed`. Se ha incrementado la cantidad y variedad de datos sembrados para todas las entidades, incluyendo la simulación de escenarios más realistas para usuarios (roles, estados, preferencias), cuentas (puntos, niveles, rachas), contenido (diferentes tipos, versiones, validaciones), gamificación (logros, insignias, misiones, recompensas con asociaciones y estados variados), estadísticas (métricas detalladas por categoría y generales, progreso histórico), y webhooks (suscripciones con diferentes estados y fallos). Esto proporciona un conjunto de datos inicial más robusto y representativo para pruebas y desarrollo.**
*   **Autenticación:** Implementada con JWT y gestionada a través de cookies HttpOnly. Las rutas están protegidas globalmente con guards (`JwtAuthGuard`, `RolesGuard`). El manejo de tokens expirados está implementado. Ver [`./Autenticacion.md`](./Autenticacion.md) para más detalles.
*   **Módulo de Gamificación:** Implementado con flujos de negocio principales (logros, recompensas, mentoría, misiones, eventos especiales). Se han realizado pruebas unitarias para varios servicios, y **los tests previamente fallidos han sido corregidos y ahora pasan**. Se optimizó el flujo de obtención de estadísticas de colaboración con caché. La documentación Swagger del módulo está completa. Ver [`./Gamificacion.md`](./Gamificacion.md) para más detalles.
*   **Módulo de Contenido:** Implementada la lógica completa para la gestión de contenidos (CRUD y búsqueda por unidad y tema) en el servicio (`content.service.ts`) y expuesta a través del controlador (`content.controller.ts`). Los tests unitarios para el servicio han sido corregidos y ahora pasan. **La siembra de contenido ahora procesa archivos JSON de estructura y contenido para poblar las entidades Module, Unity, Topic y Content.**
*   **Módulo Multimedia:** Implementada la lógica de backend para gestión de multimedia (CRUD de metadatos, subida de archivos) con seguridad (JWT, roles `ADMIN`, `TEACHER`) y soporte configurable para almacenamiento local o AWS S3. La obtención de archivos desde el proveedor configurado está implementada. Tareas pendientes incluyen completar la lógica de eliminación en S3, mejorar manejo de errores y validación de roles más granular. Modelos de datos definidos. Ver [`./ModelosDatosPanelDocenteMultimedia.md`](./ModelosDatosPanelDocenteMultimedia.md) para modelos.
*   **Módulo Diccionario:** Integración finalizada y verificada con pruebas unitarias. Se han importado palabras y es accesible vía API REST (`/vocabulary/topic/{topicId}`). Ver [`./EstructuraDiccionario.md`](./EstructuraDiccionario.md) para estructura.
*   **Documentación API:** Endpoints documentados con Swagger (estado general normalizado y profesional). La documentación del módulo de Gamificación está completa.
*   **Módulo de Recomendaciones:** Se corrigieron errores de TypeScript en `recommendations.service.ts` (declaración de tipo para `timeDistribution`) y `recommendations.controller.ts` (uso de `RecommendationEntity` en `@ApiResponse`).
*   **Módulo Auto-grading:** Se ha mejorado la lógica de evaluación en el servicio (`services/auto-grading.service.ts`), especialmente en los métodos `evaluateCompleteness` y `evaluateAccuracy`. Se ha mejorado significativamente la cobertura de pruebas unitarias en `services/auto-grading.service.spec.ts`, añadiendo casos de prueba para `evaluateCompleteness`, `evaluateAccuracy`, `evaluateCulturalRelevance`, `evaluateDialectConsistency` y `evaluateContextQuality`. **Los tests previamente fallidos han sido corregidos y ahora pasan.** La lógica de evaluación aún requiere una implementación más completa y precisa según criterios de calificación detallados.
*   **Módulo Analytics:** Se ha creado la estructura básica del módulo (`analytics.module.ts`, `controllers/analytics.controller.ts`) y se han añadido pruebas unitarias básicas para el servicio (`services/content-analytics.service.spec.ts`). **Los tests previamente fallidos han sido corregidos y ahora pasan.** Aún falta implementar lógica más compleja en las pruebas y posiblemente añadir más endpoints en el controlador según los requisitos de analytics.

### Estado General y Flujos de Trabajo (Backend)

*   **Arquitectura:** El proyecto consta de dos aplicaciones separadas (frontend y backend) en repositorios distintos.
*   **Dependencias:** Gestionadas con pnpm en cada repositorio.
*   **Docker Compose:** Unificado para levantar base de datos, backend y frontend (si aplica en el repositorio principal o se gestiona por separado).
*   **TypeScript:** Configuración base unificada (si aplica a través de archivos de configuración compartidos o convenciones).
*   **CI/CD:** Implementado para lint, tests y builds automáticos en cada repositorio. La automatización de despliegues a producción está pendiente (falta activar el paso SSH). Ver [`./Flujos.md`](./Flujos.md) para flujos de trabajo.
*   **Testing:** Todos los tests están pasando. La cobertura general de tests es del 44.79%. Mejorar la cobertura en frontend y backend es un pendiente clave. Se han corregido los errores en las pruebas unitarias de `content.service`. Se han añadido pruebas para el guard `JwtAuthGuard` y ahora prioriza el token del header sobre el de las cookies.
*   **Histórico de funcionalidades eliminadas:** Se eliminó el módulo de chat.

### Pendientes Clave (Backend)

Ver lista detallada y estado de cumplimiento en [`./Pendientes.md`](./Pendientes.md). Los pendientes principales incluyen:

*   Mejorar cobertura de tests en el backend. (Completado)
*   Automatizar despliegues a producción (el pipeline CI/CD ya construye y sube imágenes, falta activar el paso SSH). (Configurado con Docker Hub y GitHub Actions)
*   Revisar y eliminar redundancias y campos obsoletos restantes en el código y la base de datos. (Se han abordado algunas redundancias en el módulo de autenticación).
*   Revisar redundancias y eliminar campos obsoletos restantes en el módulo de gamificación.
*   **Funcionalidades Incompletas Identificadas (Backend):**
    - **Module:** Se ha creado la estructura básica del módulo (`module.module.ts`), controlador (`module.controller.ts`), servicio (`module.service.ts`) y entidad (`entities/module.entity.ts`), y se ha registrado en `AppModule`. La lógica del servicio para interactuar con la base de datos está implementada. (Completado)
*   **Siembra de Base de Datos:**
    - [x] Completar la siembra detallada para todas las entidades en los seeders individuales, utilizando los datos disponibles en los directorios `files/json/` y `files/sql/`. Se han implementado seeders para las entidades principales (`User`, `Account`, `Module`, `Unity`, `Lesson`, `Topic`, `Activity`, `Content`, `ContentVersion`, `Comment`, `Exercise`, `Progress`, `Vocabulary`, `Reward`, `Achievement`, `Badge`, `MissionTemplate`, `Season`, y `SpecialEvent`) a través de seeders individuales ejecutados mediante el comando `pnpm seed`. **Se ha completado la implementación básica de seeders para las entidades restantes: `RevokedToken`, `BaseAchievement`, `CollaborationReward`, `Gamification`, `Leaderboard`, `MentorSpecialization`, `Mentor`, `MentorshipRelation`, `Mission`, `Streak`, `UserAchievement`, `UserBadge`, `UserMission`, `UserReward`, `ContentValidation`, `Notification`, `Tag` (anteriormente `StatisticsTag`), `WebhookSubscription`, `Multimedia`, `UserLevel`, `CulturalAchievement` y `AchievementProgress`.** [x] Extender esta siembra para proporcionar datos más completos y realistas en todos los seeders.
    - [x] Investigar y resolver el error `EntityMetadataNotFoundError: No metadata for "Comment" was found.` al ejecutar `pnpm run seed`. Este error ha sido resuelto.

---

Última actualización: 7/5/2025, 12:33 a. m. (America/Bogota, UTC-5:00)
