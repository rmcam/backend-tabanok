import { DataSource, DeepPartial } from "typeorm"; // Import DeepPartial
import { Achievement } from "../../features/gamification/entities/achievement.entity"; // Importar la entidad Achievement
import { Badge } from "../../features/gamification/entities/badge.entity"; // Importar la entidad Badge
import {
  MissionTemplate,
  MissionFrequency, // Importar MissionFrequency de mission-template.entity
  MissionConditions, // Importar MissionConditions
} from "../../features/gamification/entities/mission-template.entity";
import { MissionType } from "../../features/gamification/entities/mission.entity"; // Importar MissionType de mission.entity
import { DataSourceAwareSeed } from "./index";

export class MissionTemplateSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const missionTemplateRepository =
      this.dataSource.getRepository(MissionTemplate);
    const badgeRepository = this.dataSource.getRepository(Badge); // Obtener el repositorio de Badge
    const achievementRepository = this.dataSource.getRepository(Achievement); // Obtener el repositorio de Achievement

    // Obtener medallas y logros existentes para asociar en las recompensas
    const badges = await badgeRepository.find();
    const achievements = await achievementRepository.find();

    const missionTemplatesToSeed = [
      {
        title: "Completa una Lección Diaria",
        description:
          "Completa al menos una lección cada día para mantener tu ritmo.",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionFrequency.DIARIA, // Usar DIARIA del enum
        baseTargetValue: 1,
        baseRewardPoints: 20, // Recompensa de puntos
        isActive: true,
        minLevel: 1,
        maxLevel: 0,
        conditions: { type: "lessons_completed", value: 1, description: "Completar 1 lección" } as MissionConditions, // Estructura y tipo de conditions
        category: "Aprendizaje",
        tags: ["diaria", "lecciones"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardBadgeName: undefined,
        rewardAchievementName: undefined,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Practica 5 Ejercicios Semanales",
        description:
          "Refuerza tu aprendizaje completando 5 ejercicios en una semana.",
        type: MissionType.PRACTICE_EXERCISES,
        frequency: MissionFrequency.SEMANAL, // Usar SEMANAL del enum
        baseTargetValue: 5,
        baseRewardPoints: 50, // Recompensa de puntos
        isActive: true,
        minLevel: 2,
        maxLevel: 0,
        conditions: { type: "exercises_completed", value: 5, description: "Completar 5 ejercicios" } as MissionConditions,
        category: "Aprendizaje",
        tags: ["semanal", "ejercicios"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardBadgeName: undefined,
        rewardAchievementName: undefined,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Gana Puntos de Colaboración Mensuales",
        description:
          "Contribuye a la comunidad y gana 100 puntos de colaboración este mes.",
        type: MissionType.EARN_POINTS,
        frequency: MissionFrequency.MENSUAL, // Usar MENSUAL del enum
        baseTargetValue: 100,
        baseRewardPoints: 150, // Recompensa de puntos
        isActive: true,
        minLevel: 3,
        maxLevel: 0,
        conditions: { type: "points_earned_from_source", value: { source: "collaboration", amount: 100 }, description: "Ganar 100 puntos de colaboración" } as MissionConditions,
        category: "Comunidad",
        tags: ["mensual", "puntos", "colaboracion"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardBadgeName: undefined,
        rewardAchievementName: undefined,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Mantén tu Racha por 7 Días",
        description:
          "Demuestra tu constancia manteniendo una racha de estudio de 7 días.",
        type: MissionType.MAINTAIN_STREAK,
        frequency: MissionFrequency.SEMANAL,
        baseTargetValue: 7,
        baseRewardPoints: 0, // No recompensa puntos directamente
        isActive: true,
        minLevel: 1,
        maxLevel: 0,
        conditions: { type: "streak_days", value: 7, description: "Mantener racha de 7 días" } as MissionConditions,
        rewardBadgeName: "Racha Imparable", // Nombre de la medalla a buscar
        category: "Constancia",
        tags: ["semanal", "racha"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardAchievementName: undefined, // Esto se llenará con el ID de la medalla encontrada
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Completa un Logro Cultural",
        description:
          "Sumérgete en la cultura Kamëntsá y desbloquea un logro cultural.",
        type: MissionType.PROGRESS_BASED, // Usar PROGRESS_BASED o similar
        frequency: MissionFrequency.DIARIA, // Asumiendo una frecuencia diaria para verificación de progreso
        baseTargetValue: 1, // Representa desbloquear 1 logro cultural
        baseRewardPoints: 0, // No recompensa puntos directamente
        isActive: true,
        minLevel: 5,
        maxLevel: 0,
        conditions: { type: "achievement_unlocked", value: { achievementType: "cultural" }, description: "Desbloquear 1 logro cultural" } as MissionConditions, // Condición: desbloquear un logro cultural
        rewardBadgeName: "Embajador Cultural", // Nombre de la medalla a buscar
        category: "Cultura",
        tags: ["diaria", "logros", "cultural"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardAchievementName: undefined, // Esto se llenará con el ID de la medalla encontrada
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Completa Todas las Lecciones de un Tema",
        description: "Domina un tema completando todas sus lecciones.",
        type: MissionType.COMPLETE_LESSONS, // Usar COMPLETE_LESSONS con condición de tema
        frequency: MissionFrequency.DIARIA, // Asumiendo frecuencia diaria para verificación
        baseTargetValue: 1, // Representa completar todas las lecciones del tema
        baseRewardPoints: 0, // No recompensa puntos directamente
        isActive: true,
        minLevel: 4,
        maxLevel: 0,
        conditions: { type: "all_lessons_in_topic_completed", value: "Nombre del Tema", description: "Completar todas las lecciones en Nombre del Tema" } as MissionConditions, // Condición: completar todas las lecciones en "Nombre del Tema"
        rewardBadgeName: undefined,
        rewardAchievementName: undefined,
        category: "Aprendizaje",
        tags: ["diaria", "lecciones", "temas"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Alcanza Nivel 10",
        description: "Demuestra tu progreso alcanzando el nivel 10.",
        type: MissionType.PROGRESS_BASED, // Usar PROGRESS_BASED
        frequency: MissionFrequency.DIARIA, // Asumiendo frecuencia diaria para verificación
        baseTargetValue: 10, // Representa alcanzar nivel 10
        baseRewardPoints: 0, // No recompensa puntos directamente
        isActive: true,
        minLevel: 1,
        maxLevel: 0,
        conditions: { type: "user_level", value: 10, description: "Alcanzar nivel 10" } as MissionConditions, // Condición: alcanzar nivel 10
        rewardBadgeName: undefined,
        rewardAchievementName: "Logro: Nivel 10 Alcanzado", // Nombre del logro a buscar (corregido)
        category: "Progreso",
        tags: ["diaria", "nivel"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
       {
        title: 'Usa la Plataforma por 3 Días Consecutivos',
        description: 'Estudia en Tabanok por 3 días seguidos.',
        type: MissionType.MAINTAIN_STREAK,
        frequency: MissionFrequency.DIARIA,
        baseTargetValue: 3,
        baseRewardPoints: 30, // Recompensa de puntos
        isActive: true,
        minLevel: 1,
        maxLevel: 0,
        conditions: { type: 'streak_days', value: 3, description: 'Mantener racha de 3 días' } as MissionConditions,
        category: "Constancia",
        tags: ["diaria", "racha"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardBadgeName: undefined,
        rewardAchievementName: undefined,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: 'Aprende 10 Palabras Nuevas',
        description: 'Expande tu vocabulario aprendiendo 10 palabras nuevas.',
        type: MissionType.LEARN_VOCABULARY, // Usar LEARN_VOCABULARY
        frequency: MissionFrequency.DIARIA,
        baseTargetValue: 10,
        baseRewardPoints: 40, // Recompensa de puntos
        isActive: true,
        minLevel: 1,
        maxLevel: 0,
        conditions: { type: 'vocabulary_learned', value: 10, description: 'Aprender 10 palabras nuevas' } as MissionConditions,
        category: "Aprendizaje",
        tags: ["diaria", "vocabulario"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardBadgeName: undefined,
        rewardAchievementName: undefined,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: 'Participa en el Foro',
        description: 'Haz una publicación o comentario en el foro de la comunidad.',
        type: MissionType.PARTICIPATE_FORUM, // O un tipo más general si existe
        frequency: MissionFrequency.SEMANAL,
        baseTargetValue: 1,
        baseRewardPoints: 60, // Recompensa de puntos
        isActive: true,
        minLevel: 2,
        maxLevel: 0,
        conditions: { type: 'forum_activity', value: 1, description: 'Realizar 1 actividad en el foro' } as MissionConditions,
        category: "Comunidad",
        tags: ["semanal", "foro"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardBadgeName: undefined,
        rewardAchievementName: undefined,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
       {
        title: "Explora 3 Unidades",
        description: "Completa 3 unidades para expandir tu conocimiento.",
        type: MissionType.PROGRESS_BASED,
        frequency: MissionFrequency.UNICA,
        baseTargetValue: 3,
        baseRewardPoints: 0,
        isActive: true,
        minLevel: 3,
        maxLevel: 0,
        conditions: { type: "unities_completed", value: 3, description: "Completar 3 unidades" } as MissionConditions,
        rewardBadgeName: "Explorador de Unidades", // Nombre de la medalla a buscar (corregido)
        rewardAchievementName: undefined,
        category: "Progreso",
        tags: ["unica", "unidades"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Completa 10 Actividades",
        description: "Demuestra tu habilidad completando 10 actividades.",
        type: MissionType.PROGRESS_BASED, // Usar PROGRESS_BASED si COMPLETE_ACTIVITIES no existe
        frequency: MissionFrequency.UNICA,
        baseTargetValue: 10,
        baseRewardPoints: 0,
        isActive: true,
        minLevel: 4,
        maxLevel: 0,
        conditions: { type: "activities_completed", value: 10, description: "Completar 10 actividades" } as MissionConditions,
        rewardBadgeName: undefined,
        rewardAchievementName: "Logro: Maestro de Actividades", // Nombre del logro a buscar
        category: "Progreso",
        tags: ["unica", "actividades"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Aprende 50 Palabras",
        description: "Incrementa tu vocabulario aprendiendo 50 palabras nuevas.",
        type: MissionType.LEARN_VOCABULARY,
        frequency: MissionFrequency.UNICA,
        baseTargetValue: 50,
        baseRewardPoints: 0,
        isActive: true,
        minLevel: 5,
        maxLevel: 0,
        conditions: { type: "vocabulary_learned", value: 50, description: "Aprender 50 palabras nuevas" } as MissionConditions,
        rewardBadgeName: undefined,
        rewardAchievementName: "Logro: Experto en Vocabulario", // Nombre del logro a buscar
        category: "Aprendizaje",
        tags: ["unica", "vocabulario"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Primeros Pasos en Tabanok",
        description: "Completa tu primera lección y comienza tu viaje.",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionFrequency.UNICA,
        baseTargetValue: 1,
        baseRewardPoints: 30,
        isActive: true,
        minLevel: 1,
        maxLevel: 0,
        conditions: { type: "lessons_completed", value: 1, description: "Completar 1 lección" } as MissionConditions,
        rewardBadgeName: "Aprendiz de Bronce", // Nombre de la medalla a buscar
        rewardAchievementName: undefined,
        category: "Progreso",
        tags: ["unica", "lecciones"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Contribuidor de la Comunidad",
        description: "Realiza una publicación o comentario en el foro.",
        type: MissionType.PARTICIPATE_FORUM,
        frequency: MissionFrequency.DIARIA,
        baseTargetValue: 1,
        baseRewardPoints: 25,
        isActive: true,
        minLevel: 2,
        maxLevel: 0,
        conditions: { type: "forum_activity", value: 1, description: "Realizar 1 actividad en el foro" } as MissionConditions,
        rewardBadgeName: "Comentarista Pro", // Nombre de la medalla a buscar
        rewardAchievementName: undefined,
        category: "Comunidad",
        tags: ["diaria", "foro"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      // Nuevas misiones para mayor realismo
      {
        title: "Completa 5 Lecciones en una Semana",
        description: "Avanza en tu aprendizaje completando 5 lecciones esta semana.",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionFrequency.SEMANAL,
        baseTargetValue: 5,
        baseRewardPoints: 80,
        isActive: true,
        minLevel: 2,
        maxLevel: 0,
        conditions: { type: "lessons_completed", value: 5, description: "Completar 5 lecciones" } as MissionConditions,
        category: "Aprendizaje",
        tags: ["semanal", "lecciones"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardBadgeName: undefined,
        rewardAchievementName: undefined,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Alcanza Nivel 5",
        description: "Demuestra tu progreso alcanzando el nivel 5.",
        type: MissionType.PROGRESS_BASED,
        frequency: MissionFrequency.UNICA,
        baseTargetValue: 5,
        baseRewardPoints: 0,
        isActive: true,
        minLevel: 1,
        maxLevel: 0,
        conditions: { type: "user_level", value: 5, description: "Alcanzar nivel 5" } as MissionConditions,
        rewardBadgeName: undefined,
        rewardAchievementName: "Logro: Nivel 5 Alcanzado", // Nombre del logro a buscar (corregido)
        category: "Progreso",
        tags: ["unica", "nivel"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Completa un Módulo",
        description: "Domina un área de conocimiento completando un módulo.",
        type: MissionType.COMPLETE_LESSONS, // O PROGRESS_BASED si aplica mejor
        frequency: MissionFrequency.UNICA,
        baseTargetValue: 1, // Representa completar 1 módulo
        baseRewardPoints: 0,
        isActive: true,
        minLevel: 6,
        maxLevel: 0,
        conditions: { type: "modules_completed", value: 1, description: "Completar 1 módulo" } as MissionConditions,
        rewardBadgeName: undefined,
        rewardAchievementName: "Logro: Módulo Completado", // Nombre del logro a buscar (asumiendo que existe o se creará)
        category: "Progreso",
        tags: ["unica", "modulos"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Racha de 15 Días",
        description: "Mantén tu racha de estudio por 15 días consecutivos.",
        type: MissionType.MAINTAIN_STREAK,
        frequency: MissionFrequency.DIARIA,
        baseTargetValue: 15,
        baseRewardPoints: 80,
        isActive: true,
        minLevel: 3,
        maxLevel: 0,
        conditions: { type: "streak_days", value: 15, description: "Mantener racha de 15 días" } as MissionConditions,
        category: "Constancia",
        tags: ["diaria", "racha"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardBadgeName: undefined,
        rewardAchievementName: "Logro: Racha de 15 Días", // Nombre del logro a buscar (asumiendo que existe o se creará)
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Aprende 25 Palabras Nuevas en una Semana",
        description: "Expande tu vocabulario rápidamente aprendiendo 25 palabras esta semana.",
        type: MissionType.LEARN_VOCABULARY,
        frequency: MissionFrequency.SEMANAL,
        baseTargetValue: 25,
        baseRewardPoints: 70,
        isActive: true,
        minLevel: 3,
        maxLevel: 0,
        conditions: { type: "vocabulary_learned", value: 25, description: "Aprender 25 palabras nuevas" } as MissionConditions,
        category: "Aprendizaje",
        tags: ["semanal", "vocabulario"],
        startDate: undefined,
        endDate: undefined,
        isSecret: false,
        limitedQuantity: undefined,
        isLimited: false,
        rewardBadgeName: undefined,
        rewardAchievementName: "Logro: Vocabulario Semanal", // Nombre del logro a buscar (asumiendo que existe o se creará)
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
      {
        title: "Misión Limitada: Evento Cultural de Primavera",
        description: "Participa en el evento cultural de primavera y gana puntos extra.",
        type: MissionType.PARTICIPATE_FORUM, // O un tipo más general si existe
        frequency: MissionFrequency.UNICA, // Es un evento único
        baseTargetValue: 1, // Participar en 1 evento
        baseRewardPoints: 100,
        isActive: true,
        minLevel: 1,
        maxLevel: 0,
        conditions: { type: "cultural_event_participation", value: "Evento Cultural de Primavera", description: "Participar en el Evento Cultural de Primavera" } as MissionConditions,
        category: "Cultura",
        tags: ["unica", "evento", "limitada"],
        isLimited: true,
        startDate: new Date('2025-03-20T00:00:00Z'), // Ejemplo de fecha de inicio
        endDate: new Date('2025-03-27T23:59:59Z'), // Ejemplo de fecha de fin
        isSecret: false,
        limitedQuantity: undefined,
        rewardBadgeName: undefined,
        rewardAchievementName: "Logro: Evento Cultural Primavera", // Nombre del logro a buscar (asumiendo que existe o se creará)
        bonusConditions: undefined,
        requirements: undefined,
        difficultyScaling: undefined,
      },
    ];


    for (const templateData of missionTemplatesToSeed) {
      const existingTemplate = await missionTemplateRepository.findOne({ where: { title: templateData.title } });

      if (!existingTemplate) {
        // Buscar y asociar medallas/logros si existen
        let rewardBadgeId = undefined;
        let rewardAchievementId = undefined;

        if (templateData.rewardBadgeName) {
            const associatedBadge = badges.find(b => b.name === templateData.rewardBadgeName);
            if (associatedBadge) {
                rewardBadgeId = associatedBadge.id; // Asignar solo el ID
            } else {
                console.warn(`Badge with name "${templateData.rewardBadgeName}" not found for Mission Template "${templateData.title}". Reward will not have a badge association.`);
            }
        }

        if (templateData.rewardAchievementName) {
             const associatedAchievement = achievements.find(a => a.name === templateData.rewardAchievementName);
             if (associatedAchievement) {
                 rewardAchievementId = associatedAchievement.id; // Asignar solo el ID
             } else {
                 console.warn(`Achievement with name "${templateData.rewardAchievementName}" not found for Mission Template "${templateData.title}". Reward will not have an achievement association.`);
             }
        }

        // Construir un objeto con solo las propiedades de la entidad MissionTemplate
        const missionTemplateData = {
            title: templateData.title,
            description: templateData.description,
            type: templateData.type,
            frequency: templateData.frequency,
            baseTargetValue: templateData.baseTargetValue,
            baseRewardPoints: templateData.baseRewardPoints,
            isActive: templateData.isActive,
            minLevel: templateData.minLevel,
            maxLevel: templateData.maxLevel,
            conditions: templateData.conditions,
            category: templateData.category,
            tags: templateData.tags ? templateData.tags.join(',') : null, // Join tags array into a comma-separated string
            startDate: templateData.startDate,
            endDate: templateData.endDate,
            isSecret: templateData.isSecret,
            limitedQuantity: templateData.limitedQuantity,
            isLimited: templateData.isLimited,
            rewardBadgeId: rewardBadgeId, // Asignar el ID de la medalla
            rewardAchievementId: rewardAchievementId, // Asignar el ID del logro
            bonusConditions: templateData.bonusConditions,
            requirements: templateData.requirements,
            difficultyScaling: templateData.difficultyScaling,
        };

        const newTemplate = missionTemplateRepository.create(missionTemplateData as DeepPartial<MissionTemplate>); // Explicitly cast to DeepPartial
        await missionTemplateRepository.save(newTemplate);
        console.log(`Mission Template "${templateData.title}" seeded.`);
      } else {
        console.log(`Mission Template "${templateData.title}" already exists. Skipping.`);
      }
    }
  }
}
