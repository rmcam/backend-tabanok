## Estado Actual del Proyecto Tabanok

---

Este documento resume el estado actual de desarrollo de los proyectos frontend y backend de Tabanok, destacando las funcionalidades implementadas, las mejoras recientes y los pendientes clav          e.

### Estado del Frontend

El frontend es una aplicación **React + Vite** con una estructura modular bien definida. Reside en su propio repositorio de Git: [`https://github.com/rmcam/frontend-tabanok`](https://github.com/rmcam/frontend-tabanok).

*   **Arquitectura:** Organizada en componentes, hooks, servicios y utilidades, siguiendo las mejores prácticas. Ver [`./Frontend-Arquitectura.md`](./Frontend-Arquitectura.md) para más detalles.
*   **Componente HomePage:** Ha sido refactorizado y mejorado significativamente, incluyendo:
    *   Sección Hero con imagen de fondo, efecto parallax, superposición de color y botones interactivos.
    *   Secciones de Características, Lecciones Destacadas (carga dinámica desde API con manejo de estado de carga/error), Testimonios (carrusel con autoplay), FAQ y Contacto (con formulario).
    *   Barra de navegación estática (`HomeNavbar`).
    *   Uso centralizado de datos para la Hero Section en `src/components/home/heroCards.ts`.
    *   Implementación de `react-router-hash-link` para desplazamiento suave.
    *   Mejoras de diseño y estilo, incluyendo la paleta de colores Kamëntsá en `tailwind.config.js`.
*   **Autenticación y Protección de Rutas:** Implementada completamente utilizando un Contexto de React (`AuthContext`) y un Proveedor (`AuthProvider`). La gestión de estado del usuario, estados de carga individuales y notificaciones (`sonner`) están centralizados. La interacción con la API de autenticación y el manejo de cookies HttpOnly se realizan en `src/auth/services/authService.ts`. Las rutas sensibles están protegidas con el componente `PrivateRoute`, que verifica autenticación y roles requeridos. Se ha añadido una ruta para la página "unauthorized". Se ha actualizado la ruta `/dashboard` para requerir los roles `user` y `student`. Ver [`./Autenticacion.md`](./Autenticacion.md) para más detalles.
*   **Hooks Personalizados:** Se utilizan hooks como `useAuth` (`src/auth/hooks/useAuth.ts`) y `useFetchUnits` (`src/hooks/useFetchUnits.ts`) para gestionar el estado y obtener datos, con almacenamiento en caché en `sessionStorage` para unidades y multimedia. Ver [`./IntegracionHooksPersonalizados.md`](./IntegracionHooksPersonalizados.md) para más detalles.
*   **Estilos:** Implementados con **Tailwind CSS** y componentes de **shadcn/ui**, con una configuración personalizada de colores inspirada en la cultura Kamëntsá. Recientemente, se han realizado ajustes en los componentes de UI básicos para mejorar la consistencia en el uso de colores, espaciado y tipografía.
*   **Internacionalización:** Configurada con `react-i18next` y se ha iniciado la traducción de los formularios de autenticación (`SigninForm.tsx`, `ForgotPasswordForm.tsx`). Sin embargo, se han encontrado errores persistentes de parsing/formato que impiden completar esta tarea actualmente.
*   **Validación Lingüística:** Validaciones básicas con **Zod** en formularios. La integración avanzada con APIs para control ortográfico y gramatical está en progreso. Ver [`./ValidacionLingüistica.md`](./ValidacionLingüistica.md) para más detalles.
*   **Accesibilidad:** En proceso, con componentes accesibles de `shadcn/ui` y mejoras específicas implementadas (ej. atributos ARIA en carruseles, `ariaLabel` en botones). Aún no cumple completamente con WCAG 2.1. Ver [`./Accesibilidad.md`](./Accesibilidad.md) y [`./Accesibilidad-Pruebas.md`](./Accesibilidad-Pruebas.md) para más detalles y guía de pruebas manuales.
*   **Gestión de Contenidos (Panel Docente):** Se ha implementado la interfaz de usuario para la gestión de contenidos en el Panel Docente unificado (`UnifiedDashboard.tsx`), incluyendo componentes para creación de actividades (`ActivityCreator`), seguimiento de estudiantes (`StudentProgress`), reportes (`ReportViewer`), carga (`MultimediaUploadForm`) y galería multimedia (`MultimediaGallery`), y gestión de contenido general (`ContentManager`). **Todos estos componentes ahora consumen los endpoints del backend correspondientes para obtener y enviar datos.**
    *   `ActivityCreator`: Permite crear actividades y guardarlas en el backend (`POST /activities`). Se ha agregado validación para la longitud del título y caracteres especiales.
    *   `StudentProgress`: Muestra el progreso de los estudiantes utilizando una barra de progreso visual, obteniendo datos del backend (`GET /analytics/studentProgress`). Se ha agregado un manejo de errores más robusto y se muestra un mensaje de error en caso de que la API no responda.
    *   `ReportViewer`: Muestra reportes, obteniendo datos del backend (`GET /statistics/reports/quick/:userId`). Se ha agregado un manejo de errores más robusto y se muestra un mensaje de error en caso de que la API no responda.
    *   `MultimediaUploadForm`: Permite subir archivos multimedia al backend (`POST /multimedia/upload`) con validación del tipo de archivo. Se ha implementado la previsualización del archivo seleccionado, la barra de progreso durante la subida y la selección de tipos de archivo permitidos, y la adición de metadatos al archivo.
    *   `MultimediaGallery`: Muestra una galería de archivos multimedia con filtros por tipo, obteniendo datos a través del hook `useMultimedia` que llama a `/multimedia`.
    *   `ContentManager`: Permite crear (`POST /content`), leer (`GET /content`), actualizar (`PUT /content/:id`) y eliminar (`DELETE /content/:id`) contenido en el backend. Se ha implementado la subida de múltiples archivos, la previsualización de archivos subidos, la eliminación de archivos subidos y el editor de texto enriquecido. Además, se ha implementado la funcionalidad de edición de contenido. Se han añadido pruebas unitarias para los componentes `CategoryManager` y `TagManager`.
    *   `CategoryManager`: Modificado para usar el endpoint `/topics` para la gestión de categorías (listar, crear, actualizar, eliminar).
    *   `TagManager`: Modificado para usar el endpoint `/tags` para la gestión de etiquetas (listar, crear, actualizar, eliminar).
*   Se agregó el componente `LatestActivities` para mostrar las últimas actividades realizadas por los estudiantes, obteniendo datos del backend (`GET /activities`).
*   Se han añadido indicadores de carga a los componentes del dashboard.
*   Se movió la verificación de la variable de entorno `VITE_API_URL` al componente `App.tsx` para que se realice solo una vez al inicio de la aplicación.
  - Implementar la funcionalidad de edición de contenido en el componente `ContentManager`. (Completado: Se ha implementado la funcionalidad de edición de contenido).
*   **Módulos/Vistas Implementadas (Configuración Inicial o Integración Básica de Datos):** Se ha completado la implementación inicial o la integración básica de datos para 10 módulos/vistas del frontend, incluyendo la configuración de rutas y la obtención básica de datos donde fue aplicable. Los módulos implementados son:
    1.  Vista de Administración de Perfil (`ProfilePage.tsx`)
    2.  Vista de Actividades (`ActivitiesPage.tsx`)
    3.  Vista principal de Gamificación (`GamificationPage.tsx`)
    4.  Sub-vista de Gamificación - Leaderboard (`LeaderboardPage.tsx`)
    5.  Sub-vista de Gamificación - Logros (`AchievementsPage.tsx`)
    6.  Vista principal de Configuración (`SettingsPage.tsx`)
    7.  Vista de Detalle de Unidad (`UnitDetail.tsx`)
    8.  Vista de Multimedia (`MultimediaPage.tsx`)
    9.  Vista de Actividad - Quiz (`QuizActivity.tsx`)
    10. Vista de Actividad - Matching (`MatchingActivity.tsx`)

### Estado del Backend

El backend es una aplicación **NestJS** conectada a **PostgreSQL**. Reside en su propio repositorio de Git: `https://github.com/rmcam/backend-tabanok`.

    *   **Base de Datos:** Migración a PostgreSQL completada, relaciones corregidas y carga de datos iniciales implementada. Se resolvieron problemas de conexión y ciclos de dependencia en migraciones. La entidad `Comment` ha sido añadida a la configuración de TypeORM en `src/data-source.ts` para asegurar la detección de metadatos. **La siembra detallada de datos para todas las entidades principales se ha completado y mejorado significativamente a través de seeders individuales ejecutados mediante un comando de `nest-commander`. Se ha incrementado la cantidad y variedad de datos sembrados para todas las entidades, incluyendo la simulación de escenarios más realistas para usuarios (roles, estados, preferencias), cuentas (puntos, niveles, rachas), contenido (diferentes tipos, versiones, validaciones), gamificación (logros, insignias, misiones, recompensas con asociaciones y estados variados), estadísticas (métricas detalladas por categoría y generales, progreso histórico), y webhooks (suscripciones con diferentes estados y fallos). Esto proporciona un conjunto de datos inicial más robusto y representativo para pruebas y desarrollo.**
    *   **Autenticación:** Implementada con JWT y gestionada a través de cookies HttpOnly. Las rutas están protegidas globalmente con guards (`JwtAuthGuard`, `RolesGuard`). El manejo de tokens expirados está implementado. Ver [`./Autenticacion.md`](./Autenticacion.md) para más detalles.
    *   **Módulo de Gamificación:** Implementado con flujos de negocio principales (logros, recompensas, mentoría, misiones, eventos especiales). Se han realizado pruebas unitarias para varios servicios, y **los tests previamente fallidos han sido corregidos y ahora pasan**. Se optimizó el flujo de obtención de estadísticas de colaboración con caché. La documentación Swagger del módulo está completa. Ver [`./Gamificacion.md`](./Gamificacion.md) para más detalles.
    *   **Módulo de Contenido:** Implementada la lógica completa para la gestión de contenidos (CRUD y búsqueda por unidad y tema) en el servicio (`content.service.ts`) y expuesta a través del controlador (`content.controller.ts`). Los tests unitarios para el servicio han sido corregidos y ahora pasan. **La siembra de contenido ahora procesa archivos JSON de estructura y contenido para poblar las entidades Module, Unity, Topic y Content.**
    *   **Módulo Multimedia:** Implementada la lógica de backend para gestión de multimedia (CRUD de metadatos, subida de archivos) con seguridad (JWT, roles `ADMIN`, `TEACHER`) y soporte configurable para almacenamiento local o AWS S3. La obtención de archivos desde el proveedor configurado está implementada. Tareas pendientes incluyen completar la lógica de eliminación en S3, mejorar manejo de errores y validación de roles más granular. Modelos de datos definidos. Ver [`./ModelosDatosPanelDocenteMultimedia.md`](./ModelosDatosPanelDocenteMultimedia.md) para modelos.
    *   **Módulo Diccionario:** Integración finalizada y verificada con pruebas unitarias. Se han importado palabras y es accesible vía API REST (`/vocabulary/topic/{topicId}`). Ver [`./EstructuraDiccionario.md`](./EstructuraDiccionario.md) para estructura.
    *   **Documentación API:** Endpoints documentados con Swagger (estado general normalizado y profesional). La documentación del módulo de Gamificación está completa.
    *   **Módulo de Recomendaciones:** Se corrigieron errores de TypeScript en `recommendations.service.ts` (declaración de tipo para `timeDistribution`) y `recommendations.controller.ts` (uso de `RecommendationEntity` en `@ApiResponse`).
    *   **Módulo Auto-grading:** Se ha mejorado la lógica de evaluación en el servicio (`services/auto-grading.service.ts`), especialmente en los métodos `evaluateCompleteness` y `evaluateAccuracy`. Se ha mejorado significativamente la cobertura de pruebas unitarias en `services/auto-grading.service.spec.ts`, añadiendo casos de prueba para `evaluateCompleteness`, `evaluateAccuracy`, `evaluateCulturalRelevance`, `evaluateDialectConsistency` y `evaluateContextQuality`. **Los tests previamente fallidos han sido corregidos y ahora pasan.** La lógica de evaluación aún requiere una implementación más completa y precisa según criterios de calificación detallados.
    *   **Módulo Analytics:** Se ha creado la estructura básica del módulo (`analytics.module.ts`, `controllers/analytics.controller.ts`) y se han añadido pruebas unitarias básicas para el servicio (`services/content-analytics.service.spec.ts`). **Los tests previamente fallidos han sido corregidos y ahora pasan.** Aún falta implementar lógica más compleja en las pruebas y posiblemente añadir más endpoints en el controlador según los requisitos de analytics.

### Estado General y Flujos de Trabajo

*   **Arquitectura:** El proyecto consta de dos aplicaciones separadas (frontend y backend) en repositorios distintos. Ver [`./Monorepo-Arquitectura.md`](./Monorepo-Arquitectura.md) para más detalles.
*   **Dependencias:** Gestionadas con pnpm en cada repositorio.
*   **Docker Compose:** Unificado para levantar base de datos, backend y frontend (si aplica en el repositorio principal o se gestiona por separado).
*   **TypeScript:** Configuración base unificada (si aplica a través de archivos de configuración compartidos o convenciones).
*   **CI/CD:** Implementado para lint, tests y builds automáticos en cada repositorio. La automatización de despliegues a producción está pendiente (falta activar el paso SSH). Ver [`./Flujos.md`](./Flujos.md) para flujos de trabajo.
*   **Testing:** Todos los tests están pasando. La cobertura general de tests es del 44.79%. Mejorar la cobertura en frontend y backend es un pendiente clave. Se han corregido los errores en las pruebas unitarias de `content.service`. Se han añadido pruebas para el guard `JwtAuthGuard` y ahora prioriza el token del header sobre el de las cookies.
*   **Histórico de funcionalidades eliminadas:** Se eliminó el módulo de chat.

### Pendientes Clave

Ver lista detallada y estado de cumplimiento en [`./Pendientes.md`](./Pendientes.md). Los pendientes principales incluyen:

*   Mejoras de accesibilidad (finalizar auditorías manuales, validar con herramientas).
*   Expandir la lógica de gamificación y testear flujos de usuario.
*   Mejorar cobertura de tests (frontend, backend, rutas privadas/tokens).
*   Automatizar despliegues a producción.
*   Planificar y desarrollar nuevas funcionalidades (paneles docente/estudiante completos, integración multimedia en frontend).
*   Internacionalizar mensajes en formularios.
*   Integrar control ortográfico y gramatical.
*   Documentar reglas y filtros personalizados.
*   Validar calidad lingüística en contenido generado por usuarios.
*   Revisar y eliminar redundancias restantes.

---

Última actualización: 7/5/2025, 12:33 a. m. (America/Bogota, UTC-5:00)
