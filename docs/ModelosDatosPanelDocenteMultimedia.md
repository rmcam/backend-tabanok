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

La implementaciรณn de la lรณgica de backend para la gestiรณn de multimedia, incluyendo seguridad y soporte para almacenamiento configurable, estรก en progreso. **Se ha implementado un seeder individual para entidades Multimedia.**

---

รltima actualizaciรณn: 7/5/2025, 12:35 a. m. (America/Bogota, UTC-5:00)
