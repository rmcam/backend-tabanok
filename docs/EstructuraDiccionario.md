# Estructura del Diccionario Kamëntsá-Español - Backend

---

Este documento describe la estructura y los metadatos del diccionario bilingüe Kamëntsá-Español consolidado, integrado en el backend de Tabanok.

## Metadata

La sección de metadatos contiene información general sobre el diccionario consolidado:

*   **Título:** Diccionario Bilingüe Kamëntsá-Español Consolidado
*   **Versión:** 2.1
*   **Fecha de procesamiento:** Abril 2025 (Actualizado)
*   **Fuentes:** Archivos JSON consolidados (ej. `backend-tabanok/json/consolidated_dictionary.json`).
*   **Estadísticas de procesamiento:** Número total y válido de entradas procesadas.
*   **Información de API:** Versión de la API y endpoints relevantes para interactuar con los datos del diccionario (búsqueda, obtención de entradas por tema, categorías, variaciones).
*   **Indices:** Información sobre los índices disponibles para búsqueda y acceso rápido (Palabras, clasificadores y variaciones).
*   **Licencia:** MIT License

## Secciones Principales

El contenido del diccionario, una vez procesado e integrado, se estructura lógicamente en las siguientes secciones principales:

*   Introducción
*   Generalidades
*   Fonética
*   Gramática
*   Diccionario (las entradas principales de palabras)
*   Recursos

---

La integración del diccionario en el backend está finalizada y las palabras son accesibles a través de la API REST en el endpoint `/vocabulary/topic/{topicId}`.

---

Última actualización: 7/5/2025, 12:34 a. m. (America/Bogota, UTC-5:00)
