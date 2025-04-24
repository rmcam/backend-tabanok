# Modelos de Datos

---

## Panel Docente

*   `TeacherDashboard`: Modelo de datos para el panel docente.

```json
{
  "TeacherDashboard": {
    "user": { ... },
    "lessons": [ ... ],
    "activities": [ ... ],
    "units": [ ... ],
    "progress": [ ... ],
    "evaluations": [ ... ]
  }
}
```

## Multimedia

*   `Multimedia`: Modelo de datos para multimedia.

```json
{
  "Multimedia": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "enum",
    "url": "string",
    "lessonId": "string",
    "metadata": "object"
  }
}
```

---

Última actualización: 23/4/2025, 3:16 p. m. (America/Bogota, UTC-5:00)
