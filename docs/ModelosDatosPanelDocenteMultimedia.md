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

*   **Usuarios (`User`):** Sembrados por `UserSeeder`.
*   **Cuentas (`Account`):** Sembrados por `AccountSeeder`, asociados a los usuarios existentes.
*   **Módulos (`Module`):** Sembrados por `ModuleSeeder`, creando la estructura principal del contenido educativo.
*   **Unidades (`Unity`):** Sembrados por `UnitySeeder`, asociados a los módulos existentes.
*   **Lecciones (`Lesson`):** Sembrados por `LessonSeeder`, asociados a las unidades existentes.
*   **Temas (`Topic`):** Sembrados por `TopicSeeder`, asociados a las unidades existentes.
*   **Actividades (`Activity`):** Sembrados por `ActivitySeeder`.
*   **Contenido (`Content`):** Sembrados por `ContentSeeder`.
*   **Versiones de Contenido (`ContentVersion`):** Sembrados por `ContentVersionSeeder`.
*   **Comentarios (`Comment`):** Sembrados por `CommentSeeder`.
*   **Ejercicios (`Exercise`): Sembrados por `ExerciseSeeder`.
*   **Progreso (`Progress`):** Sembrados por `ProgressSeeder`.
*   **Vocabulario (`Vocabulary`):** Sembrados por `VocabularySeeder`.
*   **Recompensas (`Reward`):** Sembrados por `RewardSeeder`.
*   **Logros (`Achievement`):** Sembrados por `AchievementSeeder`.
*   **Insignias (`Badge`):** Sembrados por `BadgeSeeder`.
*   **Plantillas de Misión (`MissionTemplate`):** Sembrados por `MissionTemplateSeeder`.
*   **Temporadas (`Season`):** Sembrados por `SeasonSeeder`.
*   **Eventos Especiales (`SpecialEvent`):** Sembrados por `SpecialEventSeeder`.
*   **Multimedia (`Multimedia`):** Sembrados por `MultimediaSeeder`.
*   **Estadísticas (`Statistics`):** Sembrados por `StatisticsSeeder`.
*   **Nivel de Usuario (`UserLevel`):** Sembrados por `UserLevelSeeder`.
*   **Logros Culturales (`CulturalAchievement`):** Sembrados por `CulturalAchievementSeeder`.
*   **Progreso de Logros (`AchievementProgress`):** Sembrados por `AchievementProgressSeeder`.
*   **Tokens Revocados (`RevokedToken`):** Sembrados por `RevokedTokenSeeder` (actualmente vacío).
*   **Logros Base (`BaseAchievement`):** Sembrados por `BaseAchievementSeeder`.
*   **Recompensas de Colaboración (`CollaborationReward`):** Sembrados por `CollaborationRewardSeeder`.
*   **Gamificación (`Gamification`):** Sembrados por `GamificationSeeder`.
*   **Tablas de Clasificación (`Leaderboard`):** Sembrados por `LeaderboardSeeder`.
*   **Especializaciones de Mentor (`MentorSpecialization`):** Sembrados por `MentorSpecializationSeeder`.
*   **Mentores (`Mentor`):** Sembrados por `MentorSeeder`.
*   **Relaciones de Mentoría (`MentorshipRelation`):** Sembrados por `MentorshipRelationSeeder`.
*   **Validación de Contenido (`ContentValidation`):** Sembrados por `ContentValidationSeeder`.
*   **Notificaciones (`Notification`):** Sembrados por `NotificationSeeder`.
*   **Etiquetas (`Tag`):** Sembrados por `TagSeeder` (anteriormente `StatisticsTag`).
*   **Suscripciones de Webhook (`WebhookSubscription`):** Sembrados por `WebhookSubscriptionSeeder`.

Estos seeders proporcionan datos iniciales esenciales para probar y desarrollar las funcionalidades que dependen de estas entidades.

---

La implementación de la lógica de backend para la gestión de multimedia, incluyendo seguridad y soporte para almacenamiento configurable, está en progreso. **Se ha implementado un seeder individual para entidades Multimedia.**

---

Última actualización: 7/5/2025, 12:35 a. m. (America/Bogota, UTC-5:00)
