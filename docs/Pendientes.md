# Pendientes del Proyecto Tabanok

---

Este documento lista las tareas pendientes y los próximos pasos planificados para el proyecto Tabanok, tanto en el frontend como en el backend.

## Pendientes Clave

- **Accesibilidad:**
  - Finalizar auditorías manuales de accesibilidad según WCAG 2.1.
  - Validar nuevamente la accesibilidad con herramientas automáticas y manuales después de implementar mejoras.
  - Mejorar el contraste entre el texto y la imagen de fondo en la Hero Section.
  - Añadir descripciones accesibles para iconos de react-icons y elementos visuales que aún no las tengan.
  - Mejorar la navegación por teclado en menús y diálogos si es necesario.
  - Asegurar que los formularios tengan etiquetas asociadas a cada campo y mensajes de error accesibles (`aria-invalid`, `aria-describedby`).
  - Mejorar la lectura por lectores de pantalla añadiendo descripciones y roles adecuados.
- **Testing:**
  - Mejorar la cobertura de tests en el frontend, especialmente en rutas protegidas y hooks personalizados.
  - ~~Mejorar la cobertura de tests en el backend. Se han añadido pruebas unitarias para el módulo `activity`.~~ (Completado)
- **Despliegue:**
  - ~~Automatizar despliegues a producción (el pipeline CI/CD ya construye y sube imágenes, falta activar el paso SSH).~~ (Configurado con Docker Hub y GitHub Actions)
- **Planificación y Desarrollo de Nuevas Funcionalidades:**
  - Planificar nuevas funcionalidades y mejoras detalladas.
  - Prototipar la UI de los paneles (docente y estudiante) en Figma antes de codificar.
  - Diseñar e integrar la interfaz de usuario del Panel Docente con el backend.
  - Proteger las rutas del Panel Docente con el rol `teacher` o `admin`.
  - Implementar la lógica para guardar los datos del formulario en el backend del Panel Docente.
  - Implementar la lógica para la gestión de categorías y etiquetas en el Panel Docente.
  - Mejorar la interfaz de usuario del formulario en el Panel Docente.
  - Implementar la lógica en el frontend para la subida y visualización de archivos multimedia. (Completado: Se ha implementado la validación del tipo de archivo en el componente `MultimediaUploadForm` y se han agregado filtros por tipo en el componente `MultimediaGallery`. Se ha implementado la previsualización del archivo seleccionado, la barra de progreso durante la subida y la selección de tipos de archivo permitidos, y la adición de metadatos al archivo).
  - Usar un componente `MultimediaPlayer` reutilizable en el frontend.
  - Desarrollar la galería multimedia accesible en el frontend.
  - Escribir pruebas unitarias y de integración para las nuevas funcionalidades del Panel Docente.
  - Implementar la lógica para la gestión de contenidos, progreso de estudiantes, creación de actividades y acceso a reportes en el Panel Docente. (Completado: Se ha implementado las funcionalidades de crear, leer, actualizar y eliminar contenido en el componente `ContentManager`, utilizando la API definida en `src/lib/api.ts`. Se ha implementado la subida de múltiples archivos, la previsualización de archivos subidos y el editor de texto enriquecido).
- Se agregó el componente `LatestActivities` para mostrar las últimas actividades realizadas por los estudiantes.
- Se han añadido indicadores de carga a los componentes `ActivityCreator`, `StudentProgress` y `ReportViewer`.
- Se movió la verificación de la variable de entorno `VITE_API_URL` al componente `App.tsx` para que se realice solo una vez al inicio de la aplicación.
  - Implementar la funcionalidad de edición de contenido en el componente `ContentManager`. (Completado: Se ha implementado la funcionalidad de edición de contenido).
  - **Funcionalidades Incompletas Identificadas (Backend):**
    - **Module:** Se ha creado la estructura básica del módulo (`module.module.ts`), controlador (`module.controller.ts`), servicio (`module.service.ts`) y entidad (`entities/module.entity.ts`), y se ha registrado en `AppModule`. La lógica del servicio para interactuar con la base de datos está implementada. (Completado)
- **Validación Lingüística:**
  - Internacionalizar mensajes existentes en formularios y otros componentes del frontend.
  - Integrar control ortográfico y gramatical en inputs de contenido textual.
  - Documentar reglas y filtros personalizados para validación semántica.
  - Validar calidad lingüística en contenido generado por usuarios.
- **Refactorización y Limpieza:**
  - Revisar y eliminar redundancias y campos obsoletos restantes en el código y la base de datos. (Se han abordado algunas redundancias en el módulo de autenticación).
  - Revisar redundancias y eliminar campos obsoletos restantes en el módulo de gamificación.
- Refactorizar los componentes en `src/components` para mejorar la organización y seguir las buenas prácticas (esto ya se ha iniciado según `EstadoProyecto.md`).
- ~~Corregir errores de TypeScript en el módulo de recomendaciones~~
- **Módulo de Recomendaciones:**
  - ~~Corregir errores de TypeScript en `recommendations.service.ts` y `recommendations.controller.ts`~~
- **Componentes del Dashboard:**
  - Implementar la lógica para guardar la actividad en el componente `ActivityCreator`. (Completado: Se ha integrado la llamada a la API para guardar las actividades en el backend, utilizando la API definida en `src/lib/api.ts` y agregaciones para la longitud del título y caracteres especiales).
  - Implementar la lógica para mostrar el progreso de los estudiantes en el componente `StudentProgress`. (Completado: Se ha agregado una barra de progreso visual para representar el progreso de los estudiantes, utilizando la API definida en `src/lib/api.ts`). Se ha agregado un manejo de errores más robusto y se muestra un mensaje de error en caso de que la API no responda.
  - Implementar la lógica para mostrar los reportes en el componente `ReportViewer`. (Completado: Se ha agregado una descripción para cada reporte, utilizando la API definida en `src/lib/api.ts`). Se ha agregado un manejo de errores más robusto y se muestra un mensaje de error en caso de que la API no responda.
- Se agregó el componente `LatestActivities` para mostrar las últimas actividades realizadas por los estudiantes.
- Se han añadido indicadores de carga a los componentes `ActivityCreator`, `StudentProgress` y `ReportViewer`.
- Se movió la verificación de la variable de entorno `VITE_API_URL` al componente `App.tsx` para que se realice solo una vez al inicio de la aplicación.
  - Implementar la funcionalidad de edición de contenido en el componente `ContentManager`. (Completado: Se ha implementado la funcionalidad de edición de contenido).
    - **Siembra de Base de Datos:**
      - [x] Completar la siembra detallada para todas las entidades en los seeders individuales, utilizando los datos disponibles en los directorios `files/json/` y `files/sql/`. Se han implementado seeders para las entidades principales (`User`, `Account`, `Module`, `Unity`, `Lesson`, `Topic`, `Activity`, `Content`, `ContentVersion`, `Comment`, `Exercise`, `Progress`, `Vocabulary`, `Reward`, `Achievement`, `Badge`, `MissionTemplate`, `Season`, y `SpecialEvent`) a través de seeders individuales ejecutados por un comando de `nest-commander`. **Se ha completado la implementación básica de seeders para las entidades restantes: `RevokedToken`, `BaseAchievement`, `CollaborationReward`, `Gamification`, `Leaderboard`, `MentorSpecialization`, `Mentor`, `MentorshipRelation`, `Mission`, `Streak`, `UserAchievement`, `UserBadge`, `UserMission`, `UserReward`, `ContentValidation`, `Notification`, `Tag` (anteriormente `StatisticsTag`), `WebhookSubscription`, `Multimedia`, `UserLevel`, `CulturalAchievement` y `AchievementProgress`.** El pendiente es extender esta siembra para proporcionar datos más completos y realistas en todos los seeders.
      - [ ] Investigar y resolver el error `EntityMetadataNotFoundError: No metadata for "Comment" was found.` al ejecutar `pnpm run seed`. Este error persiste a pesar de añadir la entidad `Comment` a la configuración de TypeORM y corregir la importación en el archivo principal del seeder, lo que sugiere un problema con la carga de metadatos en el contexto de ejecución de comandos CLI.


## Próximos pasos recomendados (Resumen)

1.  Finalizar auditorías manuales de accesibilidad y validar con herramientas.
2.  Mejorar cobertura de tests en frontend y backend.
3.  Automatizar despliegues a producción.
4.  Planificar y desarrollar paneles docente/estudiante completos e integración multimedia en frontend.
5.  Internacionalizar mensajes e integrar validación lingüística avanzada.
6.  Mantener la documentación y la hoja de ruta actualizadas tras cada cambio relevante.

---

Última actualización: 30/4/2025, 9:08:02 p. m. (America/Bogota, UTC-5:00)
