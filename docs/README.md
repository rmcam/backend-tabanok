# Documentación del Proyecto Tabanok

---

Este documento sirve como punto de entrada a la documentación centralizada del proyecto Tabanok, una aplicación web educativa gamificada para la revitalización lingüística Kamëntsá. Aquí encontrará información sobre la visión del proyecto, su arquitectura, los flujos de trabajo, el estado actual y detalles sobre los diferentes módulos y funcionalidades.

## Resumen

El proyecto Tabanok busca contribuir a la preservación y enseñanza de la lengua Kamëntsá mediante una plataforma web interactiva y gamificada. La aplicación consta de un frontend en React (Vite + TypeScript) y un backend en NestJS, utilizando PostgreSQL como base de datos. Estos componentes residen en repositorios separados. La documentación abarca desde la proyección del proyecto y su arquitectura hasta detalles específicos de módulos como autenticación, gamificación y multimedia, así como guías para desarrollo y contribución.

## Contenido

*   [Proyección del Proyecto](./ProyeccionProyecto.md): Describe el contexto, la justificación, los objetivos generales y específicos, las problemáticas detectadas y la estrategia pedagógica y cultural del proyecto.
*   [Estado Actual del Proyecto](./EstadoProyecto.md): Resume el estado actual de desarrollo del frontend y backend, destacando funcionalidades implementadas, mejoras recientes y pendientes clave.
*   [Arquitectura del Proyecto](./ArquitecturaGeneral.md): Describe la arquitectura general del proyecto, el flujo de comunicación entre el frontend y el backend, y las tecnologías principales utilizadas.
*   [Arquitectura del Frontend](./Frontend-Arquitectura.md): Detalla la arquitectura específica del frontend, incluyendo la estructura de componentes, la gestión de rutas, el estado de autenticación, estilos, internacionalización, validación lingüística y hooks personalizados.
*   [Autenticación y Protección de Rutas](./Autenticacion.md): Explica el flujo de autenticación, los endpoints de la API, los payloads y respuestas, y cómo se implementa la protección de rutas tanto en el frontend como en el backend, incluyendo el manejo de cookies HttpOnly y tokens expirados.
*   [Módulo de Gamificación](./Gamificacion.md): Describe el módulo de gamificación en el backend, sus flujos de negocio, mejoras recientes, relación con los usuarios y el estado de sus pruebas y documentación.
*   [Módulo Multimedia](./ModelosDatosPanelDocenteMultimedia.md): Presenta los modelos de datos clave para el Panel Docente y el módulo Multimedia en el backend, y describe el estado de implementación de la gestión de multimedia.
*   [Estructura del Diccionario](./EstructuraDiccionario.md): Detalla la estructura y los metadatos del diccionario bilingüe Kamëntsá-Español consolidado integrado en el backend.
*   [Instrucciones para Desarrollo](./InstruccionesDesarrollo.md): Proporciona instrucciones sobre los requisitos, el entorno de desarrollo, testing, linting y formateo, buenas prácticas, variables de entorno y comandos para migraciones.
*   [Flujos de trabajo](./Flujos.md): Describe los flujos de trabajo para testing y cobertura de código, despliegue (incluyendo CI/CD) y contribución al proyecto.
*   [Accesibilidad](./Accesibilidad.md): Presenta la auditoría de accesibilidad realizada en el frontend, las herramientas utilizadas y los próximos pasos.
*   [Guía para Pruebas Manuales de Accesibilidad](./Accesibilidad-Pruebas.md): Proporciona una guía detallada para realizar pruebas manuales de accesibilidad.
*   [Pendientes del Proyecto](./Pendientes.md): Lista las tareas pendientes clave y los próximos pasos planificados para el proyecto.
*   [Códigos y Configuraciones Clave](./Codigos.md): Recopila comandos importantes y detalles sobre las variables de entorno utilizadas.

---

Última actualización: 24/4/2025, 9:00 p. m. (America/Bogota, UTC-5:00)
