# Estrategia de Validación Lingüística - Frontend Kamëntsá

---

## Objetivo

Fortalecer la calidad del contenido textual mediante validaciones lingüísticas, control ortográfico y gramatical, e internacionalización para garantizar la precisión y relevancia cultural.

---

## Estado actual

*   **Validaciones básicas:** Implementadas con **Zod** en formularios como los de login y registro para validación estructural de los datos de entrada.
*   **Mensajes de error:** Se ha iniciado la internacionalización de los mensajes de error y otros textos en los formularios de autenticación (`SigninForm.tsx`, `ForgotPasswordForm.tsx`), pero se han encontrado errores persistentes de parsing/formato que impiden completar esta tarea actualmente.
*   **Control ortográfico y gramatical avanzado:** No implementado.
*   **Internacionalización (i18n):** La configuración inicial está presente (`react-i18next`) y se ha iniciado la traducción de la interfaz, pero la traducción completa y la resolución de los errores de formato/parsing están pendientes.

---

## Mejoras propuestas

*   **Internacionalización (i18n):**
    *   Traducir todos los mensajes de error y validación al español.
    *   Expandir el soporte multilingüe para incluir la lengua Kamëntsá y otros idiomas relevantes en el futuro.
    *   Utilizar completamente las capacidades de librerías como `react-i18next` para una gestión eficiente de las traducciones.
*   **Control ortográfico y gramatical:**
    *   Integrar APIs de validación lingüística como **LanguageTool** o **Grammarly SDK** para ofrecer corrección ortográfica y gramatical en tiempo real en los inputs de contenido.
    *   Validar entradas de texto al enviar formularios para asegurar la calidad del contenido generado por los usuarios.
    *   Implementar detección de errores, incoherencias y posible lenguaje ofensivo o inapropiado según el contexto cultural.
*   **Validación semántica:**
    *   Definir e implementar reglas y filtros personalizados para evitar contenido que pueda ser ofensivo, culturalmente insensible o incoherente dentro del contexto de la comunidad Kamëntsá.
    *   Documentar estas reglas y filtros para referencia.

---

## Herramientas utilizadas y recomendadas

*   **Zod:** Utilizado para validación estructural de datos en el frontend. Se pueden personalizar los mensajes de error.
*   **react-i18next:** Configurado para la internacionalización.
*   **LanguageTool API / Grammarly SDK:** Recomendadas para control ortográfico y gramatical avanzado.
*   **Librerías i18n:** `next-i18next`, `react-intl`, `formatjs` son alternativas o complementos para la gestión de traducciones.

---

## Próximos pasos

*   Internacionalizar mensajes existentes en formularios y otros componentes del frontend.
*   Integrar control ortográfico y gramatical en inputs de contenido textual.
*   Documentar reglas y filtros personalizados para validación semántica.
*   Validar calidad lingüística en contenido generado por usuarios.

---

Ver pendientes y estado de cumplimiento en [`docs/Pendientes.md`](./Pendientes.md).

---

Última actualización: 7/5/2025, 12:36 a. m. (America/Bogota, UTC-5:00)
