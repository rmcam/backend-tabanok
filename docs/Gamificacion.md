# Módulo de Gamificación - Proyecto Tabanok (Backend)

---

Este documento describe el módulo de gamificación implementado en el backend de Tabanok, sus flujos de negocio, mejoras recientes, relación con los usuarios y el estado de sus pruebas y documentación.

**Actualizado febrero 2025**

---

## Siembra de Datos

La siembra de datos para el módulo de gamificación se maneja a través de seeders individuales. Se han implementado seeders para las siguientes entidades principales de gamificación con datos de ejemplo:

-   **Recompensas (`Reward`):** Sembrados por `RewardSeeder`. Se han añadido tipos de recompensa adicionales (`DISCOUNT`, `EXCLUSIVE_CONTENT`, `CUSTOMIZATION`) al enum `RewardType` para reflejar las recompensas sembradas.
-   **Logros (`Achievement`):** Sembrados por `AchievementSeeder`.
-   **Insignias (`Badge`):** Sembrados por `BadgeSeeder`.
-   **Plantillas de Misión (`MissionTemplate`):** Sembrados por `MissionTemplateSeeder`. Se ha ajustado la estructura de la propiedad `conditions` en los datos de siembra para ser compatible con la entidad `MissionTemplate`.
-   **Temporadas (`Season`):** Sembrados por `SeasonSeeder`.
-   **Eventos Especiales (`SpecialEvent`):** Sembrados por `SpecialEventSeeder`.
-   **Nivel de Usuario (`UserLevel`):** Sembrados por `UserLevelSeeder`.
-   **Logros Culturales (`CulturalAchievement`):** Sembrados por `CulturalAchievementSeeder`.
-   **Progreso de Logros (`AchievementProgress`):** Sembrados por `AchievementProgressSeeder`.

**La siembra detallada de datos para todas las entidades de gamificación se ha completado.** Esto incluye datos enriquecidos y más realistas para las siguientes entidades:

-   **Recompensas (`Reward`):** Sembrados por `RewardSeeder`.
-   **Logros (`Achievement`):** Sembrados por `AchievementSeeder`.
-   **Insignias (`Badge`):** Sembrados por `BadgeSeeder`.
-   **Plantillas de Misión (`MissionTemplate`):** Sembrados por `MissionTemplateSeeder`.
-   **Temporadas (`Season`):** Sembrados por `SeasonSeeder`.
-   **Eventos Especiales (`SpecialEvent`):** Sembrados por `SpecialEventSeeder`.
-   **Nivel de Usuario (`UserLevel`):** Sembrados por `UserLevelSeeder`.
-   **Logros Culturales (`CulturalAchievement`):** Sembrados por `CulturalAchievementSeeder`.
-   **Progreso de Logros (`AchievementProgress`):** Sembrados por `AchievementProgressSeeder`.
-   **Logros Base (`BaseAchievement`):** Sembrados por `BaseAchievementSeeder`.
-   **Recompensas de Colaboración (`CollaborationReward`):** Sembrados por `CollaborationRewardSeeder`.
-   **Gamificación (`Gamification`):** Sembrados por `GamificationSeeder`.
-   **Tablas de Clasificación (`Leaderboard`):** Sembrados por `LeaderboardSeeder`.
-   **Especializaciones de Mentor (`MentorSpecialization`):** Sembrados por `MentorSpecializationSeeder`.
-   **Mentores (`Mentor`):** Sembrados por `MentorSeeder`.
-   **Relaciones de Mentoría (`MentorshipRelation`):** Sembrados por `MentorshipRelationSeeder`.
-   **Rachas (`Streak`):** Sembrados por `StreakSeeder`.
-   **Logros de Usuario (`UserAchievement`):** Sembrados por `UserAchievementSeeder`.
-   **Insignias de Usuario (`UserBadge`):** Sembrados por `UserBadgeSeeder`.
-   **Misiones de Usuario (`UserMission`):** Sembrados por `UserMissionSeeder`.
-   **Recompensas de Usuario (`UserReward`):** Sembrados por `UserRewardSeeder`.

---

## Flujos de negocio implementados

El módulo de gamificación abarca varios flujos de negocio para incentivar la participación y el aprendizaje:

- Logros culturales (`CulturalAchievementService`).
- Recompensas por colaboración (`CollaborationRewardService`).
- Mentoría (`MentorService`).
- Misiones (`MissionService`).
- Eventos especiales (`SpecialEventService`).

---

## Mejoras recientes

- Refactorización de `StatisticsReportService`.
- Resolución de dependencia circular entre `AuthModule` y `GamificationModule` utilizando `forwardRef()`.
- Optimización del flujo de "Obtención de estadísticas de colaboración" en `CollaborationRewardService` mediante la implementación de un sistema de caché.
- Resolución de un problema identificado en el módulo de gamificación.

---

## Relación entre Usuarios y Estadísticas

Cada usuario en la plataforma tiene una entrada asociada en la tabla `statistics` para registrar su progreso y logros en el sistema de gamificación.

---

## Pruebas Unitarias

El módulo de gamificación cuenta con pruebas unitarias para verificar el correcto funcionamiento de sus servicios principales. Se ha mejorado significativamente la cobertura de pruebas para el servicio `GamificationService` y **se han corregido los tests fallidos reportados, incluyendo los de `CollaborationRewardService`**.

### Servicios con pruebas unitarias existentes

- `GamificationService` (Cobertura mejorada para `grantPoints`, `addPoints`, `updateStats`, `getUserStats`, `grantAchievement`, `awardReward`, `assignMission`, `awardPoints`)
- `CulturalAchievementService`
- `CollaborationRewardService` (Tests corregidos y pasando)
- `DynamicMissionService` (Tests corregidos y pasando)
- `SpecialEventService` (Tests corregidos y pasando)
- `AchievementInitializerService` (Tests corregidos y pasando)
- `UserLevelService` (Cobertura mejorada y tests pasando)
- `ContentService` (Todos los tests corregidos y pasando)

---

## Pendientes

- **Cobertura de Pruebas:** Revisar y ampliar la cobertura completa de las pruebas unitarias para asegurar que todos los casos de uso estén cubiertos. Se ha añadido una prueba que simula un entorno de carga real, pero se necesita un sistema de monitorización de rendimiento para monitorizar el rendimiento en un entorno de producción real.

* Monitorizar el rendimiento de los flujos de negocio de gamificación en entornos de carga real y realizar optimizaciones adicionales si es necesario.

---

Ver lista completa de pendientes del proyecto en [`docs/Pendientes.md`](./Pendientes.md).

---

Última actualización: 30/4/2025, 5:31:03 p. m. (America/Bogota, UTC-5:00)
