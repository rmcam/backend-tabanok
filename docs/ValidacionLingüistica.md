![alt text](image.png)# Estrategia de Validación Lingüística - Frontend Kamëntsá

---

## Objetivo

Fortalecer la calidad del contenido textual mediante validaciones lingüísticas, control ortográfico y gramatical, e internacionalización.

---

## Estado actual

- Validaciones básicas con **Zod** en formularios de login y registro.
- Mensajes de error en inglés.
- Sin control ortográfico ni gramatical avanzado.
- Sin internacionalización (i18n).

---

## Mejoras propuestas

- **Internacionalización (i18n):**
  - Traducir mensajes de error y validación al español.
  - Soporte multilingüe futuro (Kamëntsá, inglés, otros).
  - Uso de librerías como `next-i18next` o `react-intl`.

- **Control ortográfico y gramatical:**
  - Integrar APIs como **LanguageTool** o **Grammarly SDK**.
  - Validar entradas de texto en tiempo real o al enviar formularios.
  - Detectar errores, incoherencias y lenguaje ofensivo.

- **Validación semántica:**
  - Reglas para evitar contenido ofensivo o incoherente.
  - Filtros personalizados según contexto cultural Kamëntsá.

---

## Herramientas recomendadas

- **LanguageTool API:** corrección ortográfica y gramatical.
- **Grammarly SDK:** sugerencias contextuales.
- **Zod:** validación estructural y mensajes personalizados.
- **Librerías i18n:** `next-i18next`, `react-intl`, `formatjs`.

---

## Próximos pasos

- Internacionalizar mensajes existentes en formularios.
- Integrar control ortográfico y gramatical en inputs de contenido.
- Documentar reglas y filtros personalizados.
- Validar calidad lingüística en contenido generado por usuarios.

---

Ver próximos pasos en [`docs/Pendientes.md`](./Pendientes.md).

---

## Última actualización

23/4/2025, 3:16 p. m. (America/Bogota, UTC-5:00)
