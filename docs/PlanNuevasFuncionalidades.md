# Planificación de Nuevas Funcionalidades y Mejoras — Proyecto Tabanok

---

## 1. Panel Docente (En Desarrollo)

**Objetivo:** Permitir a los docentes gestionar contenidos, ver progreso de estudiantes, crear actividades y acceder a reportes. Estructura básica y rutas implementadas.

**Rutas sugeridas:**
- `/teacher/dashboard` — Resumen general, accesos rápidos.
- `/teacher/students` — Lista y progreso de estudiantes.
- `/teacher/activities` — Gestión de actividades y recursos.
- `/teacher/reports` — Reportes de avance y logros.
- `/lesson/featured` - Endpoint para obtener lecciones destacadas.

**Componentes clave:**
- TeacherDashboard
- StudentList
- ActivityManager
- ReportViewer

**Notas:**
- Acceso solo para usuarios con rol `teacher` o `admin`.
- Integrar filtros, exportación de reportes y feedback visual.

---

## 2. Panel Estudiante

**Objetivo:** Brindar a los estudiantes un espacio personalizado para ver su progreso, logros, actividades recomendadas y multimedia.

**Rutas sugeridas:**
- `/student/dashboard` — Progreso, logros, actividades sugeridas.
- `/student/activities` — Acceso a actividades y recursos.
- `/student/multimedia` — Biblioteca de audio, video, imágenes.

**Componentes clave:**
- StudentDashboard
- AchievementList
- RecommendedActivities
- MultimediaLibrary

**Notas:**
- Acceso solo para usuarios con rol `student`.
- Mostrar insignias, ranking y recomendaciones personalizadas.
- Diseño del dashboard interactivo completado.

---

## 3. Integración Multimedia

**Estado Actual:** Se ha implementado la lógica de backend para la gestión de multimedia, incluyendo seguridad y soporte para almacenamiento en la nube.

**Implementación Backend:**
- Se creó el módulo `MultimediaModule` con entidad, DTOs, controlador y servicio.
- Se implementaron endpoints REST en `/multimedia` para operaciones CRUD básicas sobre los metadatos de multimedia.
- Se añadió un endpoint `POST /multimedia/upload` para la subida de archivos.
- **Se implementó lógica de seguridad robusta (autenticación JWT y roles `ADMIN`, `TEACHER`) para los endpoints de subida y acceso (`/multimedia` y `/multimedia/file/:filename`).**
- Se implementó validación básica de tamaño (máx 10MB) y tipo de archivo (imágenes, video, audio) en la subida.
- **Se refactorizó la lógica de almacenamiento de archivos al `MultimediaService`.**
- **Se añadió soporte básico para almacenamiento configurable (local o AWS S3) a través de variables de entorno (`STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`).**
- Los metadatos del archivo subido (nombre, ruta, tipo, tamaño) se guardan en la base de datos.
- **El endpoint `GET /multimedia/file/:filename` ahora maneja la obtención de archivos desde el proveedor de almacenamiento configurado (sirve localmente o redirige a URL firmada de S3).**

**Tareas Pendientes:**
- [x] Completar la implementación de la lógica de eliminación de archivos en AWS S3 en el `MultimediaService`.
- [x] Mejorar el manejo de errores en la subida y acceso a archivos (tanto local como S3).
- [x] Mejorar la obtención de archivos desde S3 (obtención de URLs firmadas implementada, manejo de streams pendiente si es necesario).
- [x] Implementar validación de roles más granular.
- [ ] Implementar la lógica en el frontend para la subida y visualización de archivos multimedia.
- [ ] Usar un componente `MultimediaPlayer` reutilizable en el frontend.
- [ ] Desarrollar la galería accesible en el frontend.
- [ ] Escribir pruebas unitarias y de integración.

**Propuesta Original:**
- Permitir subir y visualizar archivos de audio (pronunciación, canciones), video (cuentos, rituales) e imágenes (arte, símbolos).
- Soporte para formatos: mp3, wav, mp4, webm, jpg, png, svg.
- Frontend: galería accesible, reproductor integrado, descripciones y metadatos.

---

## 4. Mejoras de Usabilidad

- Mejorar feedback visual en formularios (validación, mensajes de error claros).
- Asegurar foco automático en campos clave y modales.
- Accesos rápidos y breadcrumbs en paneles.
- Tooltips y descripciones en botones críticos.
- Animaciones suaves para transiciones de vista.
- Soporte completo para navegación por teclado.

---

_Este documento sirve como hoja de ruta para las próximas funcionalidades clave del proyecto Tabanok. Ver siguientes pasos en [`docs/Pendientes.md`](./Pendientes.md)._

---

Última actualización: 22/4/2025, 12:18:24 a. m. (America/Bogota, UTC-5:00)
