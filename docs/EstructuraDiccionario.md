# Estructura del Diccionario Kamëntsá-Español

Este documento describe la estructura del diccionario bilingüe Kamëntsá-Español consolidado, basado en el archivo `files/json/consolidated_dictionary.json`.

## Metadata

La sección de metadatos contiene información general sobre el diccionario:

*   **Título:** Diccionario Bilingüe Kamëntsá-Español Consolidado
*   **Versión:** 2.0
*   **Fecha de procesamiento:** 2024-03-28
*   **Fuentes:**
    *   diccionario\_processed.json
    *   kamëntsa\_processed.json
    *   processed\_content.json
    *   structure.json
*   **Estadísticas de procesamiento:**
    *   total\_entries: 94
    *   valid\_entries: 94
    *   sections\_processed:
        *   introduccion: true
        *   generalidades: true
        *   fonetica: true
        *   gramatica: true
        *   diccionario: true
        *   recursos: true
*   **Información de API:**
    *   api\_version: 1.0
    *   endpoints:
        *   search: /api/search
        *   entry: /api/entry/{id}
        *   categories: /api/categories
        *   variations: /api/variations
*   **Indices:**
    *   palabras: palabras\_index
    *   clasificadores: clasificadores\_index
    *   variaciones: variaciones\_index

## Secciones

El diccionario se divide en las siguientes secciones principales:

### Introducción

*   Origen e Historia del idioma Kamëntsá
*   Características Lingüísticas
*   Objetivo del Diccionario

### Generalidades

*   Alfabeto Kamëntsá
*   Guía de Pronunciación - Vocales
*   Guía de Pronunciación - Consonantes

### Fonética

*   Vocales - Descripción y Ejemplos
*   Consonantes - Descripción y Ejemplos
*   Combinaciones Sonoras - Ejemplos y Reglas
*   Acentuación - Reglas y Ejemplos
*   Variaciones Dialectales - Por Región

### Gramática

*   Sustantivos
    *   Clasificadores
    *   Número
*   Verbos
    *   Tipos
    *   Conjugaciones
    *   Patrones de Uso
    *   Casos Especiales
*   Pronombres
    *   Personales

### Diccionario

*   Entradas Kamëntsá-Español
*   Entradas Español-Kamëntsá

### Recursos

*   Ejemplos - Diálogos Básicos, Frases Comunes
*   Referencias - Bibliografía, Recursos en línea
*   Anexos - Tablas de Conjugación, Clasificadores Nominales
