# Guía para Pruebas Manuales de Accesibilidad en Tabanok

---

## Objetivo

Verificar que la aplicación cumpla con WCAG 2.1, sea navegable con teclado y accesible para usuarios con lectores de pantalla (NVDA, VoiceOver).

---

## Herramientas necesarias

- **Windows:** [NVDA](https://www.nvaccess.org/download/)
- **Mac:** VoiceOver (integrado)
- Navegador Chrome, Firefox o Safari
- Teclado (sin usar mouse)

---

## Pasos generales

### 1. Navegación por teclado

- Usar `Tab` y `Shift+Tab` para recorrer todos los elementos interactivos.
- Confirmar que el foco sea visible y siga un orden lógico.
- Verificar que no existan trampas de foco (lugares donde el foco se pierde o queda atrapado).
- Probar abrir y cerrar menús, modales, formularios solo con teclado.

### 2. Pruebas con NVDA (Windows)

- Iniciar NVDA (`Ctrl+Alt+N`).
- Navegar con `Tab` y flechas.
- Usar `NVDA + T` para leer el título de la ventana.
- Usar `NVDA + flecha abajo` para modo exploración.
- Escuchar que cada elemento tenga un nombre claro (ej. "Botón: Guardar", "Enlace: Inicio").
- Confirmar que los roles sean correctos (botón, enlace, menú, encabezado).
- Verificar que los menús desplegables anuncien apertura/cierre.
- Confirmar que no se anuncien iconos decorativos innecesarios.
- Salir con `NVDA + Q`.

### 3. Pruebas con VoiceOver (Mac)

- Activar con `Cmd + F5`.
- Navegar con `Control + Option + flechas`.
- Usar `Control + Option + Shift + flechas` para saltar regiones.
- Escuchar nombres y roles.
- Confirmar que los menús y modales anuncien su estado.
- Desactivar con `Cmd + F5`.

---

## Checklist de verificación

- [ ] Todos los elementos interactivos tienen nombres claros y comprensibles.
- [ ] Los roles coinciden con la función del elemento.
- [ ] Los menús y modales anuncian apertura y cierre.
- [ ] No hay trampas de foco.
- [ ] El orden visual coincide con el orden en el DOM.
- [ ] Se usan landmarks HTML5 (`<main>`, `<nav>`, `<header>`, `<footer>`) correctamente.
- [ ] No se anuncian iconos decorativos innecesarios.
- [ ] Formularios tienen etiquetas asociadas a cada campo.
- [ ] El foco se gestiona correctamente en contenido dinámico (modales, alertas).

---

## ¿Qué hacer si detectas problemas?

- Anota el problema y la página/componente donde ocurre.
- Indica si es un problema de nombre, rol, foco, landmark, etc.
- Reporta los hallazgos para que puedan corregirse en el código.

---

## Recursos adicionales

- [WCAG 2.1 en español](https://www.w3.org/Translations/WCAG21-es/)
- [Guía rápida de accesibilidad web](https://www.w3.org/WAI/test-evaluate/)
- [Tutorial NVDA](https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts)
- [Tutorial VoiceOver](https://dequeuniversity.com/screenreaders/voiceover-keyboard-shortcuts)

---

## Registro de hallazgos

Utiliza este espacio para anotar problemas detectados. Sé específico al describir el problema, la página/componente donde ocurre y la propuesta de mejora:

| Página/Componente | Problema | Descripción | Propuesta de mejora |
|-------------------|----------|-------------|---------------------|
|                   |          |             |                     |
|                   |          |             |                     |

---

Realiza estas pruebas y documenta los hallazgos para proceder con las correcciones.
