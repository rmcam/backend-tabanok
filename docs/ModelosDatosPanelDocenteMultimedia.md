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
    "title": "string", // Título del recurso
    "description": "string", // Descripción del recurso
    "type": "enum", // Tipo de recurso (ej. 'image', 'video', 'audio')
    "url": "string", // URL de acceso al recurso (local o S3)
    "lessonId": "string", // ID de la lección asociada (opcional)
    "metadata": "object", // Metadatos adicionales (ej. duración, tamaño, dimensiones)
    "createdAt": "string", // Fecha de creación
    "updatedAt": "string" // Fecha de última actualización
  }
}
```

---

La implementación de la lógica de backend para la gestión de multimedia, incluyendo seguridad y soporte para almacenamiento configurable, está en progreso.

---

Última actualización: 24/4/2025, 8:56 p. m. (America/Bogota, UTC-5:00)
