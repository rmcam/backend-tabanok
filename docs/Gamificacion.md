# Módulo de Gamificación - Proyecto Tabanok (Backend)

---

Este documento describe el módulo de gamificación implementado en el backend de Tabanok, sus flujos de negocio, mejoras recientes, relación con los usuarios y el estado de sus pruebas y documentación.

**Actualizado febrero 2025**

---

## Siembra de Datos

La siembra de datos para el módulo de gamificación se maneja a través de seeders individuales. Se han implementado y mejorado significativamente seeders para todas las entidades de gamificación, proporcionando datos más completos y realistas.

Los seeders mejorados incluyen:

*   **Recompensas (`Reward`):** Sembrados por `RewardSeeder`. Se ha incrementado la variedad de recompensas, incluyendo diferentes tipos (puntos, insignias, logros, descuentos, contenido exclusivo, personalización, cultural, experiencia) y triggers válidos. Se ha mejorado la asociación con insignias y logros existentes y se han incluido ejemplos de recompensas limitadas por tiempo.
*   **Logros (`Achievement`):** Sembrados por `AchievementSeeder`. Se ha añadido una mayor variedad de logros con criterios y requisitos más específicos y realistas. Se ha asegurado la consistencia en la asociación con insignias existentes.
*   **Insignias (`Badge`):** Sembrados por `BadgeSeeder`. Se ha añadido una mayor variedad de insignias con diferentes categorías, tiers, requisitos y beneficios. Se ha asegurado la consistencia en la asociación con logros y recompensas.
*   **Plantillas de Misión (`MissionTemplate`):** Sembrados por `MissionTemplateSeeder`. Se ha añadido una mayor variedad de plantillas de misión con diferentes tipos, frecuencias, valores objetivo y condiciones. Se ha mejorado la asociación con insignias y logros existentes y se han incluido ejemplos de misiones limitadas por tiempo. Se han poblado los campos de categoría y tags.
*   **Temporadas (`Season`):** Sembrados por `SeasonSeeder`.
*   **Eventos Especiales (`SpecialEvent`):** Sembrados por `SpecialEventSeeder`.
*   **Nivel de Usuario (`UserLevel`):** Sembrados por `UserLevelSeeder`. Se ha generado data para todos los usuarios, mejorando el realismo y la consistencia entre nivel, puntos de experiencia y rachas. Se ha incluido historial de rachas y actividad más extenso.
*   **Logros Culturales (`CulturalAchievement`):** Sembrados por `CulturalAchievementSeeder`. Se ha añadido una mayor variedad de logros culturales con diferentes categorías, tipos, tiers y requisitos. Se ha asegurado la consistencia en la asociación con insignias y recompensas.
*   **Progreso de Logros (`AchievementProgress`):** Sembrados por `AchievementProgressSeeder`. Se ha creado progreso para un subconjunto más amplio de usuarios y logros, asegurando la consistencia entre estado, porcentaje y fecha de completitud. Se ha generado data de progreso más realista basada en los requisitos de los logros.
*   **Logros Base (`BaseAchievement`):** Sembrados por `BaseAchievementSeeder`.
*   **Recompensas de Colaboración (`CollaborationReward`):** Sembrados por `CollaborationRewardSeeder`.
*   **Gamificación (`Gamification`):** Sembrados por `GamificationSeeder`.
*   **Tablas de Clasificación (`Leaderboard`):** Sembrados por `LeaderboardSeeder`.
*   **Especializaciones de Mentor (`MentorSpecialization`):** Sembrados por `MentorSpecializationSeeder`.
*   **Mentores (`Mentor`):** Sembrados por `MentorSeeder`.
*   **Relaciones de Mentoría (`MentorshipRelation`):** Sembrados por `MentorshipRelationSeeder`.
*   **Misiones de Usuario (`UserMission`):** Sembrados por `UserMissionSeeder`. Se ha creado data para un subconjunto más amplio de usuarios y misiones, simulando progreso y estado de completitud.
*   **Recompensas de Usuario (`UserReward`):** Sembrados por `UserRewardSeeder`. Se ha creado data para un subconjunto más amplio de usuarios y recompensas, simulando estados (activo, consumido, expirado) y fechas de manera más realista, cubriendo diferentes tipos de recompensa.
*   **Tokens Revocados (`RevokedToken`):** Sembrados por `RevokedTokenSeeder` (actualmente vacío).

Estos seeders proporcionan un conjunto de datos inicial robusto y representativo para probar y desarrollar las funcionalidades del módulo de gamificación.

---

## Flujos de negocio implementados

El módulo de gamificación abarca varios flujos de negocio para incentivar la participación y el aprendizaje:

*   Logros culturales (`CulturalAchievementService`).
*   Recompensas por colaboración (`CollaborationRewardService`).
*   Mentoría (`MentorService`).
*   Misiones (`MissionService`).
*   Eventos especiales (`SpecialEventService`).

---

## Mejoras recientes

*   Refactorización de `StatisticsReportService`.
*   Resolución de dependencia circular entre `AuthModule` y `GamificationModule` utilizando `forwardRef()`.
*   Optimización del flujo de "Obtención de estadísticas de colaboración" en `CollaborationRewardService` mediante la implementación de un sistema de caché.
*   Resolución de un problema identificado en el módulo de gamificación.

---

## Relación entre Usuarios y Estadísticas

Cada usuario en la plataforma tiene una entrada asociada en la tabla `statistics` para registrar su progreso y logros en el sistema de gamificación.

---

## Pruebas Unitarias

El módulo de gamificación cuenta con pruebas unitarias para verificar el correcto funcionamiento de sus servicios principales. Se ha mejorado significativamente la cobertura de pruebas para el servicio `GamificationService` y **se han corregido los tests fallidos reportados, incluyendo los de `CollaborationRewardService`**.

### Servicios con pruebas unitarias existentes

*   `GamificationService` (Cobertura mejorada para `grantPoints`, `addPoints`, `updateStats`, `getUserStats`, `grantAchievement`, `awardReward`, `assignMission`, `awardPoints`)
*   `CulturalAchievementService`
*   `CollaborationRewardService` (Tests corregidos y pasando)
*   `DynamicMissionService` (Tests corregidos y pasando)
*   `SpecialEventService` (Tests corregidos y pasando)
*   `AchievementInitializerService` (Tests corregidos y pasando)
*   `UserLevelService` (Cobertura mejorada y tests pasando)
*   `ContentService` (Todos los tests corregidos y pasando)

---

## Pendientes

*   **Cobertura de Pruebas:** Revisar y ampliar la cobertura completa de las pruebas unitarias para asegurar que todos los casos de uso estén cubiertos. Se ha añadido una prueba que simula un entorno de carga real, pero se necesita un sistema de monitorización de rendimiento para monitorizar el rendimiento en un entorno de producción real.

* Monitorizar el rendimiento de los flujos de negocio de gamificación en entornos de carga real y realizar optimizaciones adicionales si es necesario.

---

Ver lista completa de pendientes del proyecto en [`docs/Pendientes.md`](./Pendientes.md).

---

Última actualización: 7/5/2025, 12:35 a. m. (America/Bogota, UTC-5:00)
