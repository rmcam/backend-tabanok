# Capítulo X: Desarrollo del Software Educativo Gamificado (Backend)

Este capítulo detalla el diseño, la implementación y los aspectos técnicos del backend de la aplicación web educativa gamificada para la revitalización del lenguaje materno Kamëntsá.

## X.1. Arquitectura del Backend

Describe la arquitectura general del backend, los patrones de diseño y la interconexión de módulos.

### Arquitectura General del Proyecto Tabanok

Este proyecto consta de dos aplicaciones separadas (frontend y backend) en repositorios distintos. El backend es una aplicación NestJS conectada a PostgreSQL.

#### Reporte de Documentación Swagger

| Controlador | Estado de Documentación |
|---|---|
| AccountController | Completo |
| ActivityController | Completo |
| AnalyticsController | Completo |
| AuthController | Completo |
| AutoGradingController | Completo |
| BadgeController | Completo |
| CommentsController | Completo |
| ContentController | Completo |
| ContentValidationController | Completo |
| ContentVersioningController | Completo |
| CulturalAchievementController | Completo |
| CulturalContentController | Completo |
| DictionaryController | Completo |
| EvaluationController | Completo |
| ExercisesController | Completo |
| GamificationController | Completo |
| LanguageValidationController | Completo |
| LeaderboardController | Completo |
| LessonController | Completo |
| MentorController | Completo |
| MissionController | Completo |
| MissionTemplateController | Completo |
| ModuleController | Completo |
| MultimediaController | Completo |
| NotificationController | Completo |
| ProgressController | Completo |
| RecommendationController | Completo |
| RecommendationsController | Completo |
| RewardController | Completo |
| RootController | Incompleto |
| StatisticsController | Incompleto |
| StatisticsTagController | Completo |
| TopicController | Completo |
| UnityController | Completo |
| UserController | Completo |
| UserLevelController | Completo |
| VocabularyController | Completo |

### Aspectos Generales de la Arquitectura

*   **Arquitectura:** El proyecto consta de dos aplicaciones separadas (frontend y backend) en repositorios distintos.
*   **Dependencias:** Gestionadas con pnpm en cada repositorio.
*   **Docker Compose:** Unificado para levantar base de datos, backend y frontend (si aplica en el repositorio principal o se gestiona por separado).
*   **TypeScript:** Configuración base unificada (si aplica a través de archivos de configuración compartidos o convenciones).

### Tecnologías y Aspectos Técnicos Clave

*   **Backend:** NestJS, API REST para gestionar usuarios, contenidos, progreso y gamificación.
*   **Base de datos:** PostgreSQL.
*   **Gamificación:** Lógica implementada en el backend para gestionar niveles, puntos e insignias.
*   **Internacionalización:** Configuración para soporte multilingüe (Kamëntsá, español).
*   **Seguridad y privacidad:** Implementación de medidas para proteger los datos de los usuarios, especialmente menores.

## X.2. Diseño de la Base de Datos

Esta sección detalla el diseño del modelo de datos, las entidades, relaciones, migraciones y seeders utilizados en el backend de Tabanok.

### Base de Datos

El backend utiliza **PostgreSQL** como sistema de gestión de base de datos. La migración a PostgreSQL ha sido completada, las relaciones corregidas y la carga de datos inicial implementada. Se resolvieron problemas de conexión y ciclos de dependencia en migraciones. La entidad `Comment` ha sido añadida a la configuración de TypeORM en `src/data-source.ts` para asegurar la detección de metadatos.

### Siembra de Base de Datos

La siembra detallada de datos para todas las entidades principales se ha completado y mejorado significativamente a través de seeders individuales ejecutados mediante el comando `pnpm seed`. Se ha incrementado la cantidad y variedad de datos sembrados para todas las entidades, incluyendo la simulación de escenarios más realistas para usuarios (roles, estados, preferencias), cuentas (puntos, niveles, rachas), contenido (diferentes tipos, versiones, validaciones), gamificación (logros, insignias, misiones, recompensas con asociaciones y estados variados), estadísticas (métricas detalladas por categoría y generales, progreso histórico), y webhooks (suscripciones con diferentes estados y fallos). Esto proporciona un conjunto de datos inicial más robusto y representativo para pruebas y desarrollo.

Se ha completado la implementación básica de seeders para las entidades restantes: `RevokedToken`, `BaseAchievement`, `CollaborationReward`, `Gamification`, `Leaderboard`, `MentorSpecialization`, `Mentor`, `MentorshipRelation`, `Mission`, `Streak`, `UserAchievement`, `UserBadge`, `UserMission`, `UserReward`, `ContentValidation`, `Notification`, `Tag` (anteriormente `StatisticsTag`), `WebhookSubscription`, `Multimedia`, `UserLevel`, `CulturalAchievement` y `AchievementProgress`. Se ha extendido esta siembra para proporcionar datos más completos y realistas en todos los seeders.

El error `EntityMetadataNotFoundError: No metadata for "Comment" was found.` al ejecutar `pnpm run seed` ha sido resuelto.

### Modelos de Datos Clave

Aunque no existe una única entidad `TeacherDashboard` en la base de datos, el modelo de datos conceptual para el panel docente agrupa información relevante para la gestión y seguimiento por parte de los docentes.

El modelo de datos para las entidades multimedia (`Multimedia`) representa la información sobre los recursos de audio, video e imágenes almacenados y gestionados por el backend.

```json
{
  "Multimedia": {
    "id": "string", // UUID
    "fileName": "string", // Nombre del archivo
    "filePath": "string", // Ruta o URL de acceso al recurso (local o S3)
    "fileType": "string", // Tipo de archivo (ej. 'image', 'video', 'audio')
    "mimeType": "string", // Tipo MIME del archivo (opcional)
    "size": "number", // Tamaño del archivo en bytes (opcional)
    "userId": "string", // ID del usuario que subió el archivo
    "lessonId": "string", // ID de la lección asociada (opcional)
    // Otros campos relevantes como description, upload date, uploader user pueden ser añadidos
    "createdAt": "string", // Fecha de creación
    "updatedAt": "string" // Fecha de última actualización
  }
}
```

### Seeders Implementados

La siembra de datos inicial para el backend se realiza a través de seeders individuales ubicados en `src/database/seeders/`. Estos seeders son ejecutados mediante el comando `pnpm seed`.

Los seeders implementados incluyen:

*   **Cuentas (`Account`):** Sembrados por `AccountSeeder`.
*   **Progreso de Logros (`AchievementProgress`):** Sembrados por `AchievementProgressSeeder`.
*   **Logros (`Achievement`):** Sembrados por `AchievementSeeder`.
*   **Actividades (`Activity`):** Sembrados por `ActivitySeeder`.
*   **Insignias (`Badge`):** Sembrados por `BadgeSeeder`.
*   **Logros Base (`BaseAchievement`):** Sembrados por `BaseAchievementSeeder`.
*   **Recompensas de Colaboración (`CollaborationReward`):** Sembrados por `CollaborationRewardSeeder`.
*   **Comentarios (`Comment`):** Sembrados por `CommentSeeder`.
*   **Contenido Multimedia (`ContentMultimedia`):** Sembrados por `ContentMultimediaSeeder`.
*   **Contenido (`Content`):** Sembrados por `ContentSeeder`.
*   **Validación de Contenido (`ContentValidation`):** Sembrados por `ContentValidationSeeder`.
*   **Versiones de Contenido (`ContentVersion`):** Sembrados por `ContentVersionSeeder`.
*   **Logros Culturales (`CulturalAchievement`):** Sembrados por `CulturalAchievementSeeder`.
*   **Contenido Cultural (`CulturalContent`):** Sembrados por `CulturalContentSeeder`.
*   **Ejercicios (`Exercise`):** Sembrados por `ExerciseSeeder`.
*   **Logros de Gamificación (`GamificationAchievementsAchievements`):** Sembrados por `GamificationAchievementsAchievementsSeeder`.
*   **Misiones Activas de Gamificación (`GamificationActiveMissionsMissions`):** Sembrados por `GamificationActiveMissionsMissionsSeeder`.
*   **Gamificación (`Gamification`):** Sembrados por `GamificationSeeder`.
*   **Tablas de Clasificación (`Leaderboard`):** Sembrados por `LeaderboardSeeder`.
*   **Lecciones (`Lesson`):** Sembrados por `LessonSeeder`.
*   **Mentores (`Mentor`):** Sembrados por `MentorSeeder`.
*   **Especializaciones de Mentor (`MentorSpecialization`):** Sembrados por `MentorSpecializationSeeder`.
*   **Relaciones de Mentoría (`MentorshipRelation`):** Sembrados por `MentorshipRelationSeeder`.
*   **Misiones (`Mission`):** Sembrados por `MissionSeeder`.
*   **Plantillas de Misión (`MissionTemplate`):** Sembrados por `MissionTemplateSeeder`.
*   **Módulos (`Module`):** Sembrados por `ModuleSeeder`.
*   **Multimedia (`Multimedia`):** Sembrados por `MultimediaSeeder`.
*   **Notificaciones (`Notification`):** Sembrados por `NotificationSeeder`.
*   **Progreso (`Progress`):** Sembrados por `ProgressSeeder`.
*   **Tokens Revocados (`RevokedToken`):** Sembrados por `RevokedTokenSeeder`.
*   **Recompensas (`Reward`):** Sembrados por `RewardSeeder`.
*   **Temporadas (`Season`):** Sembrados por `SeasonSeeder`.
*   **Eventos Especiales (`SpecialEvent`):** Sembrados por `SpecialEventSeeder`.
*   **Estadísticas (`Statistics`):** Sembrados por `StatisticsSeeder`.
*   **Etiquetas de Estadísticas (`StatisticsTag`):** Sembrados por `StatisticsTagSeeder`.
*   **Rachas (`Streak`):** Sembrados por `StreakSeeder`.
*   **Temas (`Topic`):** Sembrados por `TopicSeeder`.
*   **Unidades (`Unity`):** Sembrados por `UnitySeeder`.
*   **Logros de Usuario (`UserAchievement`):** Sembrados por `UserAchievementSeeder`.
*   **Insignias de Usuario (`UserBadge`):** Sembrados por `UserBadgeSeeder`.
*   **Misiones de Usuario (`UserMission`):** Sembrados por `UserMissionSeeder`.
*   **Misiones de Usuario (`UserMissionsMissions`):** Sembrados por `UserMissionsMissionsSeeder`.
*   **Recompensas de Usuario (`UserReward`):** Sembrados por `UserRewardSeeder`.
*   **Usuarios (`User`):** Sembrados por `UserSeeder`.
*   **Nivel de Usuario (`UserLevel`):** Sembrados por `UserLevelSeeder`.
*   **Vocabulario (`Vocabulary`):** Sembrados por `VocabularySeeder`.
*   **Suscripciones de Webhook (`WebhookSubscription`):** Sembrados por `WebhookSubscriptionSeeder`.

## X.3. Implementación de Módulos Clave

Describe los módulos principales del backend, sus funcionalidades, componentes y flujos de negocio.

### X.3.1. Módulo de Autenticación

### X.3.2. Módulo de Gamificación

### X.3.3. Módulo de Contenido

### X.3.4. Módulo Multimedia

### X.3.5. Módulo Diccionario

### X.3.6. Otros Módulos

## X.4. Aspectos Técnicos de Implementación

Cubre las tecnologías, configuración de entorno, dependencias, Docker, seguridad y manejo de errores.

## X.5. Proceso de Testing

Explica la estrategia de testing, herramientas, ejecución de tests y cobertura de código.

## X.6. Proceso de Despliegue

Describe el proceso de despliegue automatizado y el flujo de CI/CD.

## X.7. Estado Actual y Trabajo Futuro del Backend

Resume las funcionalidades implementadas, pendientes clave y proyecciones.
