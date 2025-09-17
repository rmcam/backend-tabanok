# Modelos de Datos Clave (Backend)

---

Este documento describe los modelos de datos clave utilizados en el backend de Tabanok, específicamente para el Panel Docente y el módulo Multimedia.

## Panel Docente

El modelo de datos conceptual para el panel docente (`TeacherDashboard`) agrupa información relevante para la gestión y seguimiento por parte de los docentes. Aunque no existe una única entidad `TeacherDashboard` en la base de datos, este modelo representa la estructura de los datos que se agregan y presentan en la interfaz del panel docente.

*   `TeacherDashboard`: Modelo de datos conceptual para el panel docente.

```json
{
  "TeacherDashboard": {
    "user": {
      "id": "string",
      "username": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "roles": ["string"],
      "status": "string"
      // ... otras propiedades del usuario
    },
    "lessons": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "topicId": "string",
        "activities": [], // Lista de actividades asociadas
        "multimedia": [] // Lista de multimedia asociada
        // ... otras propiedades de la lección
      }
    ],
    "activities": [
      {
        "id": "string",
        "type": "string", // Tipo de actividad (ej. 'quiz', 'exercise')
        "description": "string",
        "lessonId": "string"
        // ... otras propiedades de la actividad
      }
    ],
    "activities": [
      {
        // La estructura de las actividades ahora utiliza una interfaz base (BaseActivity)
        // y tipos específicos (ej. QuizActivity) definidos en src/components/dashboard/types/activity.ts
        "id": "string",
        "type": "string", // Tipo de actividad (ej. 'quiz', 'matching', 'fill-in-the-blanks')
        "title": "string",
        "description": "string",
        "lessonId": "string",
        // Propiedades específicas según el tipo de actividad (ej. questions para 'quiz')
        // ... otras propiedades de la actividad
      }
    ],
    "units": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "lessons": [] // Lista de lecciones asociadas
        // ... otras propiedades de la unidad
      }
    ],
    "progress": [
      {
        "userId": "string",
        "lessonId": "string",
        "completionStatus": "string", // Estado de completitud (ej. 'in-progress', 'completed')
        "score": "number" // Puntuación obtenida
        // ... otras propiedades de progreso
      }
    ],
    "evaluations": [
      {
        "id": "string",
        "activityId": "string",
        "studentId": "string",
        "score": "number",
        "feedback": "string"
        // ... otras propiedades de evaluación
      }
    ]
  }
}
```

## Multimedia

El modelo de datos para las entidades multimedia (`Multimedia`) representa la información sobre los recursos de audio, video e imágenes almacenados y gestionados por el backend.

*   `Multimedia`: Modelo de datos para multimedia.

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

---

## Siembra de Datos

La siembra de datos inicial para el backend se realiza a través de seeders individuales ubicados en `src/database/seeders/`. Estos seeders son ejecutados mediante el comando `pnpm seed`.

**La siembra detallada de datos para todas las entidades principales se ha completado y mejorado significativamente, proporcionando datos más completos y realistas.** Se ha incrementado la cantidad y variedad de datos sembrados para todas las entidades, incluyendo la simulación de escenarios más realistas para usuarios, cuentas, contenido, gamificación, estadísticas y webhooks. Esto proporciona un conjunto de datos inicial más robusto y representativo para pruebas y desarrollo.

Los seeders mejorados incluyen:

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

Estos seeders proporcionan datos iniciales esenciales para probar y desarrollar las funcionalidades que dependen de estas entidades.

---

La implementación de la lógica de backend para la gestión de multimedia, incluyendo seguridad y soporte para almacenamiento configurable, está en progreso. **Se ha implementado un seeder individual para entidades Multimedia.**

---

Última actualización: 7/5/2025, 12:35 a. m. (America/Bogota, UTC-5:00)
