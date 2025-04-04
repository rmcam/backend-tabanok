# Estado Actual del Proyecto

Este documento describe el estado actual del proyecto de la Aplicación para la Revitalización Lingüística Kamëntsá.

## Estado General

El proyecto se encuentra en desarrollo activo. Se están realizando las siguientes tareas:

*   Integración del diccionario Kamëntsá (completada)
*   Implementación de pruebas unitarias y E2E (completada, 184 tests pasando)
*   El servidor de desarrollo se está ejecutando sin errores.
*   Mejora de la accesibilidad del frontend

## Migración a PostgreSQL y carga de datos (Abril 2025)

### Actualización Abril 2025 (sincronización de bases de datos)

- Se corrigió la configuración de TypeORM para evitar errores de tipado y sincronización.
- Se eliminó y recreó la base de datos `tabanok` para evitar conflictos de esquema.
- Se realizó un volcado completo de la base de pruebas `tabanok_test`.
- Se restauró dicho volcado en la base `tabanok`, logrando que ambas bases tengan el mismo esquema y datos.
- Ahora la base de datos principal contiene todos los datos de prueba, facilitando el desarrollo y las pruebas integradas.

- Se aplicaron todas las migraciones a la base de datos `tabanok`.
- Se corrigieron relaciones entre entidades, especialmente `UserAchievement` y `Achievement`.
- Se ajustó el seeder para poblar datos iniciales: unidades, temas, actividades y vocabulario.
- Se verificó la correcta inserción de datos mediante consultas SQL a las tablas `unities`, `topics` y `vocabulary`.
- Se integró el diccionario Kamëntsá con más de 140 palabras importadas desde el archivo JSON consolidado.
- El diccionario puede consultarse vía API REST en `/vocabulary/topic/{topicId}` usando el ID del tema "Diccionario Kamëntsá".
- La base de datos está lista y funcional para continuar el desarrollo.

## Correcciones en Gamificación y Recompensas (Abril 2025)

- Se corrigieron errores de exportación de los enums `RewardType` y `RewardTrigger` en las entidades de gamificación.
- Se añadió el nuevo trigger `LESSON_COMPLETION` al enum `RewardTrigger`.
- Se unificaron las definiciones de las entidades `Reward` en los módulos `gamification` y `reward` para evitar incompatibilidades de tipos.
- Se ajustaron las propiedades `criteria` y `rewardValue` para que sean opcionales y compatibles entre módulos.
- Se resolvieron errores de tipado en las pruebas unitarias relacionadas con recompensas y gamificación.
- Se ejecutaron exitosamente los 43 suites de tests, con 184 tests pasando sin errores.

## Próximos Pasos (Q1 2025)
*   Integración del diccionario Kamëntsá (completada)
*   Implementación de pruebas unitarias y E2E (completada, 184 tests pasando)
*   Mejorar la accesibilidad del frontend

## Metas a Mediano Plazo (Q2-Q3 2025)

*   Desarrollar la API para la gestión de contenido cultural
*   Realizar una auditoría de accesibilidad WCAG 2.1

## Visión a Largo Plazo (Q4 2025 y más allá)

*   Expandir la plataforma con nuevas funcionalidades
*   Establecer colaboraciones con la comunidad Kamëntsá

## Issues Conocidos

*   La validación lingüística necesita mejoras (se ha agregado una nueva regla gramatical para verificar las consonantes iniciales)
*   La accesibilidad del frontend requiere mejoras significativas.
*   La lógica de gamificación no está implementada.
