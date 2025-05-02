# Módulo de Gamificación - Proyecto Tabanok (Backend)

---

Este documento describe el módulo de gamificación implementado en el backend de Tabanok, sus flujos de negocio, mejoras recientes, relación con los usuarios y el estado de sus pruebas y documentación.

**Actualizado febrero 2025**

---

## Siembra de Datos

La siembra de datos para el módulo de gamificación se maneja principalmente en `GamificationSeeder` y `LevelSeeder`.

`GamificationSeeder` siembra datos de ejemplo para las siguientes entidades:
- Logros base (`BaseAchievement`)
- Logros (`Achievement`)
- Recompensas (`Reward`)
- Insignias (`Badge`)
- Temporadas (`Season`)
- Eventos especiales (`SpecialEvent`)
- Plantillas de misiones (`MissionTemplate`)

`LevelSeeder` siembra datos de ejemplo para los niveles de usuario (`UserLevel`).

Actualmente, la siembra de datos específicos de usuario (como `UserAchievement`, `UserReward`, `UserBadge`, `UserLevel` asociado a usuarios, `UserMission`, `Streak`, `Leaderboard`) no está completamente implementada en `GamificationSeeder` y dependerá de la existencia de usuarios sembrados previamente y de la lógica adicional que se añada al seeder.

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
