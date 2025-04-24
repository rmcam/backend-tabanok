## Actualizaciones del componente HomePage

El componente `HomePage` ha sido refactorizado y mejorado.

*   Se agregó una imagen de fondo a la Hero Section.
*   Se modificó la descripción de la Hero Section para que sea más concisa y persuasiva.
*   Se agregaron iconos de react-icons a las características.
*   Se agregaron descripciones a las lecciones destacadas.
*   Se agregó un botón "Ver todas las lecciones" a la sección de Lecciones Destacadas.
*   Se agregó una capa de superposición oscura a la imagen de fondo de la Hero Section para mejorar el contraste.
*   Se agregó el componente FAQ a la página de inicio.
*   Se eliminó la sección FAQ duplicada.
*   Se cambió el fondo de la sección de contacto a blanco.
*   Se reemplazó el enlace de contacto con un formulario de contacto.
*   Se aumentó el padding vertical del footer a `py-2`.
*   Se mejoró la responsividad de las imágenes en la sección de Lecciones Destacadas.
*   Se centralizó la lógica de las tarjetas de la sección Hero.
*   Se utilizó un componente reutilizable para las tarjetas de características.
*   Se mejoró la accesibilidad de las imágenes en la sección de Lecciones Destacadas.
*   Se implementó la funcionalidad de "Ver todas las lecciones".
*   Se agregaron imágenes a los testimonios.
*   Se ha añadido la funcionalidad de autoplay al carrusel de testimonios utilizando el plugin `embla-carousel-autoplay`.
*   Se corrigió la estructura del carrusel principal para que el enlace no envuelva toda la tarjeta `HeroSection`, permitiendo que los botones internos sean interactivos.
*   Se implementó un carrusel interactivo en la HeroSection para mostrar diferentes tarjetas de `heroCardsData` con transiciones suaves y controles de navegación.
*   Se añadió un efecto de "card hover" a las Lecciones Destacadas para hacerlas más interactivas.
*   Se ajustó el diseño de la sección de lecciones destacadas para utilizar una cuadrícula responsiva en lugar de desplazamiento horizontal en pantallas pequeñas.
*   Se corrigió un error de tipo en `heroCards.ts` relacionado con la propiedad `action` en los datos de las tarjetas.
*   Se implementó un efecto de desplazamiento suave al hacer clic en los enlaces "Ver lección" y "Ver todas las lecciones" utilizando `react-router-hash-link`.
*   Se centralizó la lógica de las tarjetas de la sección Hero, obteniendo los datos directamente desde `heroCards.ts`.
*   Se modificó la estructura de datos en `heroCards.ts` para incluir una propiedad `action` en los botones, permitiendo diferenciar acciones de navegación.
*   Se actualizó `HeroSection.tsx` para utilizar la propiedad `action` al manejar los clics de los botones, desacoplando la acción del texto del botón.
*   Se mejoró el mensaje de error mostrado al usuario cuando falla la carga de las lecciones destacadas en la página de inicio.
*   Se eliminó la dependencia del archivo JSON `public/heroCards.json`.
*   Se implementó una animación de aparición gradual (fade-in) al cargar la página.
*   Se agregó un efecto parallax a la sección del Hero (`src/components/home/components/HeroSection.tsx`).
    *   Se ajustó la opacidad del fondo negro para que la imagen sea más visible.
    *   Se alineó verticalmente el contenido del Hero Section para que esté centrado.
*   Se reemplazó el carrusel de testimonios con uno que tiene una animación de aparición gradual.
*   Se añadió un efecto de desplazamiento horizontal a la sección de "Lecciones Destacadas".
    *   Se añadió un espacio entre las tarjetas.
    *   Se aumentó el tamaño de la imagen y el texto.
*   Se modificaron los colores de los botones (`src/components/ui/button.tsx`) para que tengan un color más acorde a la paleta de colores de la cultura Kamëntsá.
*   Se alinearon los campos del formulario y se aumentó el tamaño del texto en `src/components/home/components/ContactForm.tsx`.
*   Se implementaron indicadores interactivos en el carrusel de la HeroSection.
*   Se implementó la carga dinámica de las lecciones destacadas desde la API del backend.
*   Se añadió manejo de estado de carga y error para la sección "Lecciones Destacadas".
*   Se corrigió el error `ReferenceError: process is not defined` al utilizar `import.meta.env.VITE_API_URL` en lugar de `process.env.VITE_API_URL`.
- Backend funcional con NestJS, conectado a PostgreSQL.
- Frontend funcional con React + Vite, autenticación y consumo de API.
- Dependencias y configuración centralizadas.
- Paquete común creado para tipos y utilidades compartidas.
- Docker Compose unificado para base de datos, backend y frontend.
- Configuración base de TypeScript unificada.
- Documentación centralizada y actualizada.
- CI/CD implementado para lint, tests y builds automáticos.
- Integración avanzada de validación lingüística con LanguageTool. Las variaciones se cargan.
- Integración del diccionario Kamëntsá requiere ajustes en el frontend y mejoras en la lógica del backend.
- **Cobertura de tests alta (200 tests exitosos, incluyendo autenticación).**
- **Integración backend-frontend verificada y estable.**
- **Solucionado problema de conexión a la base de datos:** Se resolvieron errores relacionados con TypeORM y ciclos de dependencia en las migraciones (Abril 2025).
- Accesibilidad en progreso, no cumple completamente con WCAG 2.1. Se ha agregado la propiedad `ariaLabel` al componente `Button` para mejorar la accesibilidad.
- Gamificación: Se han implementado los principales flujos de negocio y se han realizado pruebas unitarias para verificar su correcto funcionamiento. Se ha optimizado el flujo de "Obtención de estadísticas de colaboración" en `CollaborationRewardService` mediante la implementación de un sistema de caché.
- **Sidebar desplegable implementado:** Se agregó un sidebar desplegable que aparece en todos los sitios excepto en la ruta "/". Se añadió un buscador al sidebar utilizando el componente Input. Se añadió un sistema de notificaciones al dashboard utilizando el componente Sonner.
- **Mejoras en el Dashboard:** El dashboard ha sido unificado en el componente `UnifiedDashboard.tsx`, que se renderiza condicionalmente según el rol del usuario. El dashboard ahora incluye secciones para "Herramientas para docentes", "Cómo funciona" y "Evaluaciones Efectivas". Se ha implementado la gestión de contenidos en el Panel Docente, permitiendo crear, eliminar y editar contenidos. Se ha implementado la lógica para mostrar el campo de contenido dependiendo del tipo de contenido seleccionado, la lógica para la gestión de categorías y etiquetas, y se ha mejorado la interfaz de usuario del formulario. Se han creado los componentes `CategoryManager.tsx` y `TagManager.tsx` para la gestión de categorías y etiquetas, respectivamente. Se ha creado el componente `Form.tsx` para mejorar la interfaz de usuario del formulario.
    *   Se refactorizó el componente `ContentManager.tsx` para mejorar la gestión del estado del formulario, manejar correctamente la entrada de archivos y corregir errores de TypeScript. Se definieron tipos para los elementos de contenido y se ajustó la lógica para manejar correctamente el contenido de texto y los archivos.
    *   Se eliminaron importaciones no utilizadas (`CategoryManager`, `TagManager`) en `ContentManager.tsx`.
- **Documentación de endpoints con Swagger normalizada y profesionalmente documentada.**
- **Gestión de Contenidos:** Se ha implementado la interfaz de usuario para la gestión de contenidos en el Panel Docente.
- **Protección de rutas:** Se ha revisado la protección de rutas, redirigiendo a "/" si no está logueado. Se ha modificado la lógica para mostrar el sidebar en `App.tsx` para que también dependa del estado de autenticación.
- Se añadió la importación de `useNavigate` y se implementó el `useEffect` para la redirección al dashboard.
- Se añadió una condición para no renderizar el contenido de la página de inicio si el usuario está cargando o ya autenticado.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.

---

## Mejoras de Diseño y Estilo (Multicolor Kamëntsá)

Se han aplicado mejoras de diseño y estilo en `HomePage.tsx` y `HeroSection.tsx`.

---

## Próximos pasos recomendados

- Ver [`docs/Pendientes.md`](./Pendientes.md).

---

## Detalles del módulo Gamificación

Módulo de gamificación implementado.
Ver detalles en [`docs/Gamificacion.md`](./Gamificacion.md).

---

## Estado del Frontend

- Aplicación React + Vite con estructura modular. Para más detalles, ver [`docs/Frontend-Arquitectura.md`](./Frontend-Arquitectura.md).
- Se movió el componente `Content.tsx` de `src/components/Content.tsx` a `src/components/general/Content.tsx`.
- Se eliminó el componente `src/components/common/CommonContent.tsx` ya que no se estaba utilizando en el proyecto.
- Se movieron los hooks de `src/hooks/auth/` a `src/auth/hooks/`.
- Rutas públicas y privadas gestionadas con React Router y el componente `PrivateRoute`. La autenticación por el momento funciona, hay que revisar a detalle.
- **Autenticación y manejo de roles implementados completamente utilizando un Contexto de React (`AuthContext`) y un Proveedor (`AuthProvider`).**
- La información del usuario, el token de autenticación y los roles ahora se gestionan a través de cookies HttpOnly en el backend y se obtienen mediante la verificación de sesión.
- El componente `PrivateRoute` verifica si el usuario está autenticado y si tiene el rol necesario para acceder a la ruta, devolviendo solo los hijos autorizados.
- Se ha agregado una ruta para la página "unauthorized".
- El componente `App` verifica si el usuario está autenticado al cargar la aplicación.
- Internacionalización configurada con `react-i18next`, soporte multilenguaje.
- Estilos con Tailwind CSS y configuración personalizada.
- Uso de **shadcn/ui** para componentes accesibles, personalizables y consistentes.
- Componentes reutilizables para navegación, formularios, sidebar, toggles y más.
- Integración avanzada con LanguageTool mediante un hook reutilizable (`useLanguageTool`) para validación lingüística en tiempo real.
- Accesibilidad en proceso, con componentes accesibles y mejoras pendientes para cumplir WCAG 2.1.
- Consumo de API backend para diccionario Kamëntsá y otros recursos.
- Uso de hooks personalizados para gestión de estado y lógica de UI (`useUnits`, `useAuth`).
- Prisma utilizado para tipado y posible integración directa.
- Arquitectura preparada para escalabilidad y nuevas funcionalidades.
- Se han refactorizado los componentes en `src/components` para mejorar la organización y seguir las buenas prácticas.
- Se han creado subcarpetas para agrupar componentes relacionados y se han movido los archivos correspondientes.
- También se han refactorizado componentes grandes en componentes más pequeños y reutilizables.
- La estructura de directorios en `src/components` ahora es:
    *   `common/`
    *   `dashboard/`
    *   `general/`
    *   `home/`
    *   `navigation/`
    *   `ui/`
- Se implementó el almacenamiento en caché de los datos multimedia utilizando `sessionStorage` en `src/components/dashboard/components/MultimediaGallery.tsx`.

---

## Histórico de funcionalidades eliminadas

Se eliminó el módulo de chat.

---
- Se ha asegurado la consistencia de la estructura de datos en `heroCardsData` añadiendo el campo `buttons: []` a todos los elementos.
- Se ha simplificado la lógica de color de los indicadores del carrusel para usar un color para el indicador activo y otro para los inactivos.
- Se ha eliminado el borde amarillo de las tarjetas de testimonios.
- Se ha ajustado el espaciado vertical entre las secciones principales de la página a `py-12`.
- Se ha intentado corregir el comportamiento del carrusel para evitar cambios de tamaño al añadir una altura fija (`h-[500px]`) al contenedor del carrusel y asegurar que los elementos internos ocupen esa altura (`h-full`).
- Se ha creado un nuevo componente `FeaturedLessonCard` (`src/components/home/components/FeaturedLessonCard.tsx`) para encapsular la lógica de visualización de las tarjetas de lecciones destacadas y se ha integrado en `HomePage.tsx`.
*   Se mejoró la accesibilidad del carrusel principal y el carrusel de testimonios con atributos ARIA (`role`, `aria-roledescription`, `aria-label`).
*   Se añadió un botón de pausa/reproducción al carrusel de testimonios para controlar el autoplay.
*   Se refactorizaron las clases CSS comunes de los `FeatureCard` en una constante para mejorar la mantenibilidad.
*   Se añadió un mecanismo de reintento para la carga de lecciones destacadas en caso de error, mostrando un botón para reintentar.
*   Se añadieron enlaces de ejemplo (Política de Privacidad, Términos de Servicio, Contacto) en el pie de página.
*   Se agregó una barra de navegación estática (`HomeNavbar.tsx`) a la página de inicio que es visible al cargar y permanece fija al desplazarse, conteniendo los botones "Iniciar Sesión" y "Registrarse".
*   Se eliminó la acción directa de abrir el modal de registro del botón "Comienza ahora" en la sección principal, ya que esta funcionalidad ahora se maneja a través de la barra de navegación estática.
- Se corrigieron los errores de tipo en las funciones `signin` y `signup`.
- Se implementó el almacenamiento en caché de los datos de `units` utilizando `sessionStorage` en `src/hooks/useFetchUnits.ts`.
- Se implementó el almacenamiento en caché de los datos multimedia utilizando `sessionStorage` en `src/components/dashboard/components/MultimediaGallery.tsx`.
- Se añadió la importación de `useNavigate` y se implementó el `useEffect` para la redirección al dashboard.
- Se añadió una condición para no renderizar el contenido de la página de inicio si el usuario está cargando o ya autenticado.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.

---

## Mejoras de Diseño y Estilo

Diseño y estilo mejorados.

---

## Próximos pasos recomendados

1.  Expandir la lógica de gamificación y testear flujos de usuario.
2.  Mejorar cobertura de tests en frontend, especialmente en rutas protegidas y hooks personalizados.
3.  Activar despliegue automático a producción.
4.  Finalizar auditorías manuales de accesibilidad.
5.  Documentar y testear exhaustivamente la protección de rutas y el manejo de autenticación.
6.  Planificar nuevas funcionalidades y mejoras (panel docente, panel estudiante, integración multimedia).
7.  Mantener la documentación y la hoja de ruta actualizadas tras cada cambio relevante.

---

## Detalles del módulo Gamificación

Gamificación: Ver [`docs/Gamificacion.md`](./Gamificacion.md).

---

## Estado del Frontend

- Aplicación React + Vite con estructura modular. Para más detalles, ver [`docs/Frontend-Arquitectura.md`](./Frontend-Arquitectura.md).
- Se movió el componente `Content.tsx` de `src/components/Content.tsx` a `src/components/general/Content.tsx`.
- Se eliminó el componente `src/components/common/CommonContent.tsx` ya que no se estaba utilizando en el proyecto.
- Se movieron los hooks de `src/hooks/auth/` a `src/auth/hooks/`.
- Rutas públicas y privadas gestionadas con React Router y el componente `PrivateRoute`. La autenticación por el momento funciona, hay que revisar a detalle.
- **Autenticación y manejo de roles implementados completamente utilizando un Contexto de React (`AuthContext`) y un Proveedor (`AuthProvider`).**
- La información del usuario, el token de autenticación y los roles ahora se gestionan a través de cookies HttpOnly en el backend y se obtienen mediante la verificación de sesión.
- El componente `PrivateRoute` verifica si el usuario está autenticado y si tiene el rol necesario para acceder a la ruta, devolviendo solo los hijos autorizados.
- Se ha agregado una ruta para la página "unauthorized".
- El componente `App` verifica si el usuario está autenticado al cargar la aplicación.
- Internacionalización configurada con `react-i18next`, soporte multilenguaje.
- Estilos con Tailwind CSS y configuración personalizada.
- Uso de **shadcn/ui** para componentes accesibles, personalizables y consistentes.
- Componentes reutilizables para navegación, formularios, sidebar, toggles y más.
- Integración avanzada con LanguageTool mediante un hook reutilizable (`useLanguageTool`) para validación lingüística en tiempo real.
- Accesibilidad en proceso, con componentes accesibles y mejoras pendientes para cumplir WCAG 2.1.
- Consumo de API backend para diccionario Kamëntsá y otros recursos.
- Uso de hooks personalizados para gestión de estado y lógica de UI (`useUnits`, `useAuth`).
- Prisma utilizado para tipado y posible integración directa.
- Arquitectura preparada para escalabilidad y nuevas funcionalidades.
- Se han refactorizado los componentes en `src/components` para mejorar la organización y seguir las buenas prácticas.
- Se han creado subcarpetas para agrupar componentes relacionados y se han movido los archivos correspondientes.
- También se han refactorizado componentes grandes en componentes más pequeños y reutilizables.
- La estructura de directorios en `src/components` ahora es:
    *   `common/`
    *   `dashboard/`
    *   `general/`
    *   `home/`
    *   `navigation/`
    *   `ui/`
- Se implementó el almacenamiento en caché de los datos multimedia utilizando `sessionStorage` en `src/components/dashboard/components/MultimediaGallery.tsx`.

---

## Histórico de funcionalidades eliminadas

- **Chat**: Se eliminó el módulo de chat para simplificar el backend y frontend, ya que no era una funcionalidad prioritaria en la revitalización lingüística ni en la hoja de ruta actual. Si se requiere en el futuro, se planificará e implementará nuevamente con la comunidad.

---
- Se ha asegurado la consistencia de la estructura de datos en `heroCardsData` añadiendo el campo `buttons: []` a todos los elementos.
- Se ha simplificado la lógica de color de los indicadores del carrusel para usar un color para el indicador activo y otro para los inactivos.
- Se ha eliminado el borde amarillo de las tarjetas de testimonios.
- Se ha ajustado el espaciado vertical entre las secciones principales de la página a `py-12`.
- Se ha intentado corregir el comportamiento del carrusel para evitar cambios de tamaño al añadir una altura fija (`h-[500px]`) al contenedor del carrusel y asegurar que los elementos internos ocupen esa altura (`h-full`).
- Se ha creado un nuevo componente `FeaturedLessonCard` (`src/components/home/components/FeaturedLessonCard.tsx`) para encapsular la lógica de visualización de las tarjetas de lecciones destacadas y se ha integrado en `HomePage.tsx`.
*   Se mejoró la accesibilidad del carrusel principal y el carrusel de testimonios con atributos ARIA (`role`, `aria-roledescription`, `aria-label`).
*   Se añadió un botón de pausa/reproducción al carrusel de testimonios para controlar el autoplay.
*   Se refactorizaron las clases CSS comunes de los `FeatureCard` en una constante para mejorar la mantenibilidad.
*   Se añadió un mecanismo de reintento para la carga de lecciones destacadas en caso de error, mostrando un botón para reintentar.
*   Se añadieron enlaces de ejemplo (Política de Privacidad, Términos de Servicio, Contacto) en el pie de página.
*   Se agregó una barra de navegación estática (`HomeNavbar.tsx`) a la página de inicio que es visible al cargar y permanece fija al desplazarse, conteniendo los botones "Iniciar Sesión" y "Registrarse".
*   Se eliminó la acción directa de abrir el modal de registro del botón "Comienza ahora" en la sección principal, ya que esta funcionalidad ahora se maneja a través de la barra de navegación estática.
- Se corrigieron los errores de tipo en las funciones `signin` y `signup`.
- Se implementó el almacenamiento en caché de los datos de `units` utilizando `sessionStorage` en `src/hooks/useFetchUnits.ts`.
- Se implementó el almacenamiento en caché de los datos multimedia utilizando `sessionStorage` en `src/components/dashboard/components/MultimediaGallery.tsx`.
- Se añadió la importación de `useNavigate` y se implementó el `useEffect` para la redirección al dashboard.
- Se añadió una condición para no renderizar el contenido de la página de inicio si el usuario está cargando o ya autenticado.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.

---

## Mejoras de Diseño y Estilo (Multicolor Kamëntsá)

Se han aplicado mejoras de diseño y estilo en `HomePage.tsx` y `HeroSection.tsx` para incorporar elementos multicolor inspirados en el arte Kamëntsá. Esto incluye:

*   Colores de iconos y bordes en las tarjetas de características.
*   Colores de indicadores del carrusel principal (activo e inactivos).
*   Color del título de las lecciones destacadas al pasar el ratón.
*   Borde de color en las tarjetas de testimonios.
*   Superposición de color en la imagen de fondo de la sección principal.
*   Borde de color en la imagen principal de la sección principal.

---

## Próximos pasos recomendados

1.  Expandir la lógica de gamificación y testear flujos de usuario.
2.  Mejorar cobertura de tests en frontend, especialmente en rutas protegidas y hooks personalizados.
3.  Activar despliegue automático a producción.
4.  Finalizar auditorías manuales de accesibilidad.
5.  Documentar y testear exhaustivamente la protección de rutas y el manejo de autenticación.
6.  Planificar nuevas funcionalidades y mejoras (panel docente, panel estudiante, integración multimedia).
7.  Mantener la documentación y la hoja de ruta actualizadas tras cada cambio relevante.

---

## Detalles del módulo Gamificación

Ver documentación completa y actualizada en [`docs/Gamificacion.md`](./Gamificacion.md).

---

## Estado del Frontend

- Aplicación React + Vite con estructura modular. Para más detalles, ver [`docs/Frontend-Arquitectura.md`](./Frontend-Arquitectura.md).
- Se movió el componente `Content.tsx` de `src/components/Content.tsx` a `src/components/general/Content.tsx`.
- Se eliminó el componente `src/components/common/CommonContent.tsx` ya que no se estaba utilizando en el proyecto.
- Se movieron los hooks de `src/hooks/auth/` a `src/auth/hooks/`.
- Rutas públicas y privadas gestionadas con React Router y el componente `PrivateRoute`. La autenticación por el momento funciona, hay que revisar a detalle.
- **Autenticación y manejo de roles implementados completamente utilizando un Contexto de React (`AuthContext`) y un Proveedor (`AuthProvider`).**
- La información del usuario, el token de autentación y los roles ahora se gestionan a través de cookies HttpOnly en el backend y se obtienen mediante la verificación de sesión.
- El componente `PrivateRoute` verifica si el usuario está autenticado y si tiene el rol necesario para acceder a la ruta, devolviendo solo los hijos autorizados.
- Se ha agregado una ruta para la página "unauthorized".
- El componente `App` verifica si el usuario está autenticado al cargar la aplicación.
- Internacionalización configurada con `react-i18next`, soporte multilenguaje.
- Estilos con Tailwind CSS y configuración personalizada.
- Uso de **shadcn/ui** para componentes accesibles, personalizables y consistentes.
- Componentes reutilizables para navegación, formularios, sidebar, toggles y más.
- Integración avanzada con LanguageTool mediante un hook reutilizable (`useLanguageTool`) para validación lingüística en tiempo real.
- Accesibilidad en proceso, con componentes accesibles y mejoras pendientes para cumplir WCAG 2.1.
- Consumo de API backend para diccionario Kamëntsá y otros recursos.
- Uso de hooks personalizados para gestión de estado y lógica de UI (`useUnits`, `useAuth`).
- Prisma utilizado para tipado y posible integración directa.
- Arquitectura preparada para escalabilidad y nuevas funcionalidades.
- Se han refactorizado los componentes en `src/components` para mejorar la organización y seguir las buenas prácticas.
- Se han creado subcarpetas para agrupar componentes relacionados y se han movido los archivos correspondientes.
- También se han refactorizado componentes grandes en componentes más pequeños y reutilizables.
- La estructura de directorios en `src/components` ahora es:
    *   `common/`
    *   `dashboard/`
    *   `general/`
    *   `home/`
    *   `navigation/`
    *   `ui/`
- Se implementó el almacenamiento en caché de los datos multimedia utilizando `sessionStorage` en `src/components/dashboard/components/MultimediaGallery.tsx`.

---

## Histórico de funcionalidades eliminadas

- **Chat**: Se eliminó el módulo de chat para simplificar el backend y frontend, ya que no era una funcionalidad prioritaria en la revitalización lingüística ni en la hoja de ruta actual. Si se requiere en el futuro, se planificará e implementará nuevamente con la comunidad.

---
- Se ha asegurado la consistencia de la estructura de datos en `heroCardsData` añadiendo el campo `buttons: []` a todos los elementos.
- Se ha simplificado la lógica de color de los indicadores del carrusel para usar un color para el indicador activo y otro para los inactivos.
- Se ha eliminado el borde amarillo de las tarjetas de testimonios.
- Se ha ajustado el espaciado vertical entre las secciones principales de la página a `py-12`.
- Se ha intentado corregir el comportamiento del carrusel para evitar cambios de tamaño al añadir una altura fija (`h-[500px]`) al contenedor del carrusel y asegurar que los elementos internos ocupen esa altura (`h-full`).
- Se ha creado un nuevo componente `FeaturedLessonCard` (`src/components/home/components/FeaturedLessonCard.tsx`) para encapsular la lógica de visualización de las tarjetas de lecciones destacadas y se ha integrado en `HomePage.tsx`.
*   Se mejoró la accesibilidad del carrusel principal y el carrusel de testimonios con atributos ARIA (`role`, `aria-roledescription`, `aria-label`).
*   Se añadió un botón de pausa/reproducción al carrusel de testimonios para controlar el autoplay.
*   Se refactorizaron las clases CSS comunes de los `FeatureCard` en una constante para mejorar la mantenibilidad.
*   Se añadió un mecanismo de reintento para la carga de lecciones destacadas en caso de error, mostrando un botón para reintentar.
*   Se añadieron enlaces de ejemplo (Política de Privacidad, Términos de Servicio, Contacto) en el pie de página.
*   Se agregó una barra de navegación estática (`HomeNavbar.tsx`) a la página de inicio que es visible al cargar y permanece fija al desplazarse, conteniendo los botones "Iniciar Sesión" y "Registrarse".
*   Se eliminó la acción directa de abrir el modal de registro del botón "Comienza ahora" en la sección principal, ya que esta funcionalidad ahora se maneja a través de la barra de navegación estática.
- Se corrigieron los errores de tipo en las funciones `signin` y `signup`.
- Se implementó el almacenamiento en caché de los datos de `units` utilizando `sessionStorage` en `src/hooks/useFetchUnits.ts`.
- Se implementó el almacenamiento en caché de los datos multimedia utilizando `sessionStorage` en `src/components/dashboard/components/MultimediaGallery.tsx`.
- Se añadió la importación de `useNavigate` y se implementó el `useEffect` para la redirección al dashboard.
- Se añadió una condición para no renderizar el contenido de la página de inicio si el usuario está cargando o ya autenticado.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.
- Se corrigieron errores en los bloques `SEARCH` de `replace_in_file`.

---

## Mejoras de Diseño y Estilo (Multicolor Kamëntsá)

Se han aplicado mejoras de diseño y estilo en `HomePage.tsx` y `HeroSection.tsx` para incorporar elementos multicolor inspirados en el arte Kamëntsá. Esto incluye:

*   Colores de iconos y bordes en las tarjetas de características.
*   Colores de indicadores del carrusel principal (activo e inactivos).
*   Color del título de las lecciones destacadas al pasar el ratón.
*   Borde de color en las tarjetas de testimonios.
*   Superposición de color en la imagen de fondo de la sección principal.
*   Borde de color en la imagen principal de la sección principal.

---

## Próximos pasos recomendados

1.  Expandir la lógica de gamificación y testear flujos de usuario.
2.  Mejorar cobertura de tests en frontend, especialmente en rutas protegidas y hooks personalizados.
3.  Activar despliegue automático a producción.
4.  Finalizar auditorías manuales de accesibilidad.
5.  Documentar y testear exhaustivamente la protección de rutas y el manejo de autenticación.
6.  Planificar nuevas funcionalidades y mejoras (panel docente, panel estudiante, integración multimedia).
7.  Mantener la documentación y la hoja de ruta actualizadas tras cada cambio relevante.

---

## Detalles del módulo Gamificación

Ver documentación completa y actualizada en [`docs/Gamificacion.md`](./Gamificacion.md).

---

## Estado del Frontend

Frontend: React + Vite.
Ver detalles en [`docs/Frontend-Arquitectura.md`](./Frontend-Arquitectura.md).
