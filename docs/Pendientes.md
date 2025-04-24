# Pendientes

---

## Próximos pasos

- Implementar mejoras recomendadas de accesibilidad.
- Validar nuevamente la accesibilidad con herramientas automáticas y manuales.
- Expandir la lógica de gamificación.
- Finalizar auditorías manuales de accesibilidad.
- Planificar nuevas funcionalidades y mejoras.
- Prototipar la UI de los paneles en Figma antes de codificar.
- Documentar cada avance y mantener este plan actualizado.
- Internacionalizar mensajes existentes en formularios.
- Integrar control ortográfico y gramatical en inputs de contenido.
- Documentar reglas y filtros personalizados.
- Validar calidad lingüística en contenido generado por usuarios.
- Mejorar accesibilidad según WCAG 2.1.
- Mejorar cobertura de tests en el frontend.
- Mejorar cobertura de tests en el backend.
- Agregar pruebas automáticas para rutas privadas y manejo de tokens expirados.
- Configurar CI/CD.
- Automatizar despliegues a producción (el pipeline ya construye y sube imágenes, falta activar paso SSH).
- Revisar redundancias y eliminar campos obsoletos restantes.
- Revisar redundancias y eliminar campos obsoletos restantes en el módulo de gamificación.
- Revisar la cobertura completa de las pruebas unitarias para asegurar que todos los casos de uso estén cubiertos.
- Monitorizar el rendimiento de los flujos de negocio y realizar optimizaciones adicionales si es necesario.
- Implementar la lógica de gestión de contenidos, progreso de estudiantes, creación de actividades y acceso a reportes en el Panel Docente.
- Diseñar la interfaz de usuario del Panel Docente.
- Integrar el Panel Docente con el backend.
- Proteger las rutas del Panel Docente con el rol `teacher` o `admin`.
- Implementar la lógica para mostrar el campo de contenido dependiendo del tipo de contenido seleccionado en el Panel Docente.
- Implementar la lógica para guardar los datos del formulario en el backend del Panel Docente.
- Implementar la lógica para la gestión de categorías y etiquetas en el Panel Docente.
- Mejorar la interfaz de usuario del formulario en el Panel Docente.
- Refactorizar los componentes en `src/components` para mejorar la organización y seguir las buenas prácticas.
- [x] Actualizar la documentación para reflejar los cambios en el componente `HomePage`. | ✅ |
- Mejorar el contraste entre el texto y la imagen de fondo en la Hero Section.
- [x] Implementar un carrusel interactivo en la HeroSection para mostrar diferentes tarjetas de `heroCardsData` con transiciones suaves y controles de navegación. | ✅ |
- Añadir un efecto de "card hover" a las Lecciones Destacadas para hacerlas más interactivas.
- Implementar un efecto de desplazamiento suave al hacer clic en los enlaces "Ver lección" y "Ver todas las lecciones" utilizando `react-router-hash-link`.
- [x] Implementar el almacenamiento de tokens en `HttpOnly cookies` (requiere cambios en el backend). | ✅ | (Implementado en backend y frontend).
- [x] Confirmar la lógica de usar el email como username por defecto en el registro con los requisitos del backend. | ✅ |
- Se implementó el almacenamiento en caché de los datos multimedia utilizando `sessionStorage` en `src/components/dashboard/components/MultimediaGallery.tsx`.
- Se corrigieron los errores de tipo en las funciones `signin` y `signup`.
- Se implementó el almacenamiento en caché de los datos de `units` utilizando `sessionStorage` en `src/hooks/useFetchUnits.ts`.

## Estado de cumplimiento

| Pauta WCAG 2.1                   | Estado      | Notas                                                                  |
| -------------------------------- | ----------- | ---------------------------------------------------------------------- |
| Contraste suficiente             | En progreso | Revisar colores secundarios y hover (mejorado)                           |
| Navegación por teclado           | En progreso | Mejorar en menús y formularios (mejorado en Sidebar, se agregó focus-visible:outline-none)                    |
| Etiquetas y roles ARIA           | En progreso | Añadir en botones, inputs, iconos de react-icons (mejorado en formulario de búsqueda y Sidebar) |
| Mensajes de error accesibles     | En progreso | Integrar con validación y ARIA (mejorado en formulario de búsqueda)    |
| Lectura por lectores de pantalla | En progreso | Añadir descripciones y roles                                           |
| Componentes revisados            | Completado  | Se han revisado y mejorado los componentes `Progress`, `RewardsSection`, `Carousel`, `RecommendationsSection`, `CommunitySection`, `EntryDetailWrapper`, `NotFound`, `PrivateRoute`, `ProfilePage` y `StudentDashboard`. |

## Mejoras en el componente `PrivateRoute`

- Se ha movido el tipo `User` al archivo `src/auth/types/authTypes.ts` para facilitar su reutilización.
- Se ha mejorado la redirección de usuarios no autenticados utilizando el componente `Navigate` de `react-router-dom` directamente.
- Se ha mejorado el indicador de carga utilizando un componente `Loading` más sofisticado.
- **Ahora utiliza el AuthContext para verificar la autenticación y habilita la verificación de roles. Además, se ha unificado la lógica de los dashboards en el componente `UnifiedDashboard.tsx`.**

## Hallazgos preliminares

- [ ] Falta de descripciones accesibles para iconos de react-icons y elementos visuales.
- [ ] Navegación por teclado funcional, pero mejorable en menús y diálogos.
- [x] Formularios sin mensajes de error accesibles (`aria-invalid`, `aria-describedby`). | ✅ | (Se añadió feedback visual de error en los inputs y se integró con el sistema de notificaciones placeholder `showToast`. Se implementó un formulario de registro de varios pasos con validación por pasos y feedback visual de error en `SignupForm.tsx`, refactorizado para usar estados de carga del contexto y simplificar la lógica de validación).
- [x] Considerar la implementación de un **sistema de notificación global** (ej. toast) para mostrar mensajes de éxito o error después del envío del formulario. | ✅ | (Se integró `sonner` para notificaciones en el módulo de autenticación).
- [ ] Expandir la lógica de gamificación.
- [ ] Configurar CI/CD.
- [ ] Automatizar despliegues a producción.
- [ ] Revisar redundancias y eliminar campos obsoletos restantes.
- [ ] Mejorar cobertura de tests en el frontend.
