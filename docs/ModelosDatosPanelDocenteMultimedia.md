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
    "lessonId": "string", // ID de la lección asociada (opcional)
    // Otros campos relevantes como description, upload date, uploader user pueden ser añadidos
    "createdAt": "string", // Fecha de creación
    "updatedAt": "string" // Fecha de última actualización
  }
}
```

---

## Siembra de Datos Misceláneos

El `MiscellaneousSeeder` es responsable de sembrar datos de ejemplo para varias entidades que no encajan en las categorías de Usuario, Gamificación o Contenido principal. Estas entidades son cruciales para funcionalidades como el panel docente, el seguimiento del progreso y la interacción con el contenido.

Las entidades sembradas por `MiscellaneousSeeder` incluyen:

-   **Actividades (`Activity`):** Representa diferentes tipos de actividades interactivas (ej. quizzes, juegos de memoria) asociadas a lecciones o temas.
-   **Comentarios (`Comment`):** Permite la discusión y retroalimentación sobre versiones de contenido.
-   **Ejercicios (`Exercise`):** Define ejercicios específicos que los usuarios pueden completar, vinculados a lecciones o temas.
-   **Multimedia (`Multimedia`):** Información sobre archivos multimedia (audio, video, imágenes) utilizados en el contenido o actividades.
-   **Progreso (`Progress`):** Registra el progreso de un usuario en actividades o ejercicios específicos.
-   **Estadísticas (`Statistics`):** Almacena métricas y resúmenes del rendimiento y actividad del usuario.

Estos seeders proporcionan datos iniciales para probar y desarrollar las funcionalidades que dependen de estas entidades, como la visualización de actividades en el panel docente, el seguimiento del progreso del usuario y la presentación de estadísticas.

---

La implementación de la lógica de backend para la gestión de multimedia, incluyendo seguridad y soporte para almacenamiento configurable, está en progreso. **Se ha añadido siembra básica para entidades Multimedia.**

---

Última actualización: 2/5/2025, 3:05:00 p. m. (America/Bogota, UTC-5:00)
