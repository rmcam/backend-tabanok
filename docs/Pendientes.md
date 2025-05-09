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
  - Mejorar la cobertura de tests en el backend.
- **Despliegue:**
  - Automatizar despliegues a producción (el pipeline CI/CD ya construye y sube imágenes, falta activar el paso SSH).
- **Planificación y Desarrollo de Nuevas Funcionalidades:**
  - Planificar nuevas funcionalidades y mejoras detalladas.
  - Prototipar la UI de los paneles (docente y estudiante) en Figma antes de codificar.
  - Diseñar e integrar la interfaz de usuario del Panel Docente con el backend.
  - Proteger las rutas del Panel Docente con el rol `teacher` o `admin`.
  - Implementar la lógica para guardar los datos del formulario en el backend del Panel Docente.
  - Implementar la lógica para la gestión de categorías y etiquetas en el Panel Docente. (Completado en frontend)
  - Mejorar la interfaz de usuario del formulario en el Panel Docente.
  - Usar un componente `MultimediaPlayer` reutilizable en el frontend.
  - Desarrollar la galería multimedia accesible en el frontend.
  - Escribir pruebas unitarias y de integración para las nuevas funcionalidades del Panel Docente.
- **Funcionalidades Incompletas Identificadas (Backend):**
  - **Módulo Multimedia:** Completada la lógica de eliminación en S3 (manejo de errores más granular) y mejorada la validación de roles más granular.
  - **Módulo Auto-grading:** Implementada lógica más compleja y precisa en la evaluación según criterios de calificación detallados (comparación de sinónimos). Las pruebas unitarias para este módulo han sido corregidas y ahora pasan.
  - **Módulo Analytics:** Implementada lógica más compleja en las pruebas y añadido el endpoint `studentProgress` en el controlador según los requisitos de analytics.
  - **Validación Lingüística:** Implementada lógica detallada para validar la calidad lingüística en contenido generado por usuarios (análisis de la estructura de las oraciones y verificación de la concordancia gramatical).
  - **Refactorización y Limpieza:** Revisar redundancias y eliminar campos obsoletos restantes en el código y la base de datos.
  - Revisar redundancias y eliminar campos obsoletos restantes en el módulo de gamificación. **(Revisión completada en `CollaborationRewardService`)**
- Refactorizar los componentes en `src/components` para mejorar la organización y seguir las buenas prácticas.
- **Módulo de Recomendaciones:**
  - ~~Corregir errores de TypeScript en `recommendations.service.ts` y `recommendations.controller.ts`~~ (Completado)
- **Componentes del Dashboard:**
  - Implementar la lógica para guardar la actividad en el componente `ActivityCreator`. (Completado)
  - Implementar la lógica para mostrar el progreso de los estudiantes en el componente `StudentProgress`. (Completado)
  - Implementar la lógica para mostrar los reportes en el componente `ReportViewer`. (Completado)
- Se agregó el componente `LatestActivities` para mostrar las últimas actividades realizadas por los estudiantes. (Completado)
- Se han añadido indicadores de carga a los componentes `ActivityCreator`, `StudentProgress` y `ReportViewer`. (Completado)
- Se movió la verificación de la variable de entorno `VITE_API_URL` al componente `App.tsx` para que se realice solo una vez al inicio de la aplicación. (Completado)
  - Implementar la funcionalidad de edición de contenido en el componente `ContentManager`. (Completado)
  - Implementar la lógica en el frontend para la subida y visualización de archivos multimedia. (Completado)
    - **Siembra de Base de Datos:**
      - [x] Completar la siembra detallada para todas las entidades en los seeders individuales, utilizando los datos disponibles en los directorios `files/json/` y `files/sql/`. (Completado)
      - [x] Extender esta siembra para proporcionar datos más completos y realistas en todos los seeders. (Completado)
      - [x] Investigar y resolver el error `EntityMetadataNotFoundError: No metadata for "Comment" was found.` al ejecutar `pnpm run seed`. (Completado)

## Pendientes Clave (Actualizado)

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
  - Mejorar la cobertura de tests en el backend.
- **Despliegue:**
  - Automatizar despliegues a producción (el pipeline CI/CD ya construye y sube imágenes, falta activar el paso SSH).
- **Planificación y Desarrollo de Nuevas Funcionalidades:**
  - Planificar nuevas funcionalidades y mejoras detalladas.
  - Prototipar la UI de los paneles (docente y estudiante) en Figma antes de codificar.
  - Diseñar e integrar la interfaz de usuario del Panel Docente con el backend.
  - Proteger las rutas del Panel Docente con el rol `teacher` o `admin`.
  - Implementar la lógica para guardar los datos del formulario en el backend del Panel Docente.
  - Mejorar la interfaz de usuario del formulario en el Panel Docente.
  - Usar un componente `MultimediaPlayer` reutilizable en el frontend.
  - Desarrollar la galería multimedia accesible en el frontend.
  - Escribir pruebas unitarias y de integración para las nuevas funcionalidades del Panel Docente.
- **Panel Estudiante:**
  - Completar la implementación del Panel Estudiante en el frontend, incluyendo la integración detallada de datos y la visualización de todos los elementos planificados (progreso, logros, recomendaciones, narrativas culturales). (En progreso)
  - Refinar la interfaz de usuario del Panel Estudiante.
- **Actividades Interactivas:**
  - Implementar otros tipos de actividades interactivas (ej. juegos de memoria, etc.). (En progreso)
  - Refinar la visualización de resultados detallados para cada tipo de actividad (Quiz, Emparejamiento, Completar Espacios). (En progreso)
  - Integrar completamente las actualizaciones de gamificación en el frontend después de completar una actividad (mostrar puntos ganados, insignias desbloqueadas, etc.). (Pendiente)
  - Conectar las actividades interactivas con el flujo de lecciones y recomendaciones. (Pendiente)
- **Funcionalidades Incompletas Identificadas (Backend):**
  - **Módulo Multimedia:** Completada la lógica de eliminación en S3 (manejo de errores más granular) y mejorada la validación de roles más granular.
  - **Módulo Auto-grading:** Implementada lógica más compleja y precisa en la evaluación según criterios de calificación detallados (comparación de sinónimos).
  - **Módulo Analytics:** Implementada lógica más compleja en las pruebas y añadido el endpoint `studentProgress` en el controlador según los requisitos de analytics.
  - **Validación Lingüística:** Implementada lógica detallada para validar la calidad lingüística en contenido generado por usuarios (análisis de la estructura de las oraciones y verificación de la concordancia gramatical).
  - **Refactorización y Limpieza:** Revisar redundancias y eliminar campos obsoletos restantes en el código y la base de datos.
  - Revisar redundancias y eliminar campos obsoletos restantes en el módulo de gamificación. **(Revisión completada en `CollaborationRewardService`)**
- Refactorizar los componentes en `src/components` para mejorar la organización y seguir las buenas prácticas.
- **Módulo de Recomendaciones:**
  - ~~Corregir errores de TypeScript en `recommendations.service.ts` y `recommendations.controller.ts`~~ (Completado)
- **Componentes del Dashboard:**
  - Implementar la lógica para guardar la actividad en el componente `ActivityCreator`. (Completado)
  - Implementar la lógica para mostrar el progreso de los estudiantes en el componente `StudentProgress`. (Completado)
  - Implementar la lógica para mostrar los reportes en el componente `ReportViewer`. (Completado)
- Se agregó el componente `LatestActivities` para mostrar las últimas actividades realizadas por los estudiantes. (Completado)
- Se han añadido indicadores de carga a los componentes `ActivityCreator`, `StudentProgress` y `ReportViewer`. (Completado)
- Se movió la verificación de la variable de entorno `VITE_API_URL` al componente `App.tsx` para que se realice solo una vez al inicio de la aplicación. (Completado)
  - Implementar la funcionalidad de edición de contenido en el componente `ContentManager`. (Completado)
  - Implementar la lógica en el frontend para la subida y visualización de archivos multimedia. (Completado)
    - **Siembra de Base de Datos:**
      - [x] Completar la siembra detallada para todas las entidades en los seeders individuales, utilizando los datos disponibles en los directorios `files/json/` y `files/sql/`. (Completado)
      - [x] Extender esta siembra para proporcionar datos más completos y realistas en todos los seeders. (Completado)
      - [x] Investigar y resolver el error `EntityMetadataNotFoundError: No metadata for "Comment" was found.` al ejecutar `pnpm run seed`. (Completado)

## Próximos pasos recomendados (Resumen)

1.  Finalizar auditorías manuales de accesibilidad y validar con herramientas.
2.  Mejorar cobertura de tests en frontend y backend.
3.  Automatizar despliegues a producción.
4.  Planificar y desarrollar paneles docente/estudiante completos e integración multimedia en frontend.
5.  Internacionalizar mensajes e integrar validación lingüística avanzada.
6.  Mantener la documentación y la hoja de ruta actualizadas tras cada cambio relevante.

---

Última actualización: 8/5/2025, 3:52 p. m. (America/Mexico_City, UTC-6:00)
