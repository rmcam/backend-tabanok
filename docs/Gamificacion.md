# Módulo de Gamificación - Proyecto Tabanok

**Actualizado abril 2025**

---

## Flujos de negocio

*   Logros culturales (`CulturalAchievementService`).
*   Recompensas por colaboración (`CollaborationRewardService`).
*   Mentoría (`MentorService`).
*   Misiones (`MissionService`).
*   Eventos especiales (`SpecialEventService`).

---

## Mejoras

*   Refactorización de `StatisticsReportService`.
*   Resolución de dependencia circular entre `AuthModule` y `GamificationModule` con `forwardRef()`.

---

## Relación entre Usuarios y Estadísticas

Cada usuario tiene una entrada en la tabla `statistics`.

---

## Pruebas Unitarias

El módulo de gamificación cuenta con pruebas unitarias.

### Servicios con pruebas unitarias

*   `GamificationService`
*   `LeaderboardService`
*   `MissionService`
*   `CulturalAchievementService`
*   `CollaborationRewardService`
*   `MentorService`

---

## Pendientes

*   Revisar la cobertura completa de las pruebas unitarias.
*   Monitorizar el rendimiento de los flujos de negocio.
*   Documentar completamente las API del módulo utilizando Swagger.

---

Última actualización: 20/4/2025, 2:00:00 a. m. (America/Bogota, UTC-5:00)
