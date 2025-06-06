import { DataSource } from "typeorm";
import { MissionFrequency, MissionTemplate, MissionConditions, MissionRewards } from "../../features/gamification/entities/mission-template.entity";
import {
  Mission,
  MissionType,
} from "../../features/gamification/entities/mission.entity";
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { User } from "../../auth/entities/user.entity";
import { Badge } from '../../features/gamification/entities/badge.entity'; // Importar Badge

export class MissionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  private mapConditionsToCriteria(conditions: MissionConditions | undefined, missionType: MissionType, baseTargetValue: number): { type: MissionType; value: { type: string; value: any; description: string; }; description: string; } | undefined {
    if (!conditions) {
        return undefined;
    }

    let innerCriteriaValue: { type: string; value: any; description: string; } | undefined;
    let criteriaDescription: string;

    switch (missionType) {
        case MissionType.MAINTAIN_STREAK:
            if (conditions.streakDays !== undefined) {
                innerCriteriaValue = { type: 'streak_days', value: conditions.streakDays, description: `Mantener racha de ${conditions.streakDays} días` };
            }
            break;
        case MissionType.PROGRESS_BASED:
            if (conditions.achievementType !== undefined) {
                // Hacer la descripción más dinámica
                innerCriteriaValue = { type: 'achievement_unlocked', value: { achievementType: conditions.achievementType }, description: `Desbloquear logro de tipo: ${conditions.achievementType}` };
            } else if (conditions.userLevel !== undefined) {
                innerCriteriaValue = { type: 'user_level', value: conditions.userLevel, description: `Alcanzar nivel ${conditions.userLevel}` };
            } else if (conditions.unitiesCompleted !== undefined) {
                innerCriteriaValue = { type: 'unities_completed', value: conditions.unitiesCompleted, description: `Completar ${conditions.unitiesCompleted} unidades` };
            } else if (conditions.activitiesCompleted !== undefined) {
                innerCriteriaValue = { type: 'activities_completed', value: conditions.activitiesCompleted, description: `Completar ${conditions.activitiesCompleted} actividades` };
            }
            break;
        case MissionType.COMPLETE_LESSONS:
            if (conditions.lessons !== undefined) {
                innerCriteriaValue = { type: 'lessons_completed', value: conditions.lessons, description: `Completar ${conditions.lessons} lección(es)` };
            } else if (conditions.topic !== undefined) {
                innerCriteriaValue = { type: 'all_lessons_in_topic_completed', value: conditions.topic, description: `Completar todas las lecciones en ${conditions.topic}` };
            } else if (conditions.modulesCompleted !== undefined) {
                innerCriteriaValue = { type: 'modules_completed', value: conditions.modulesCompleted, description: `Completar ${conditions.modulesCompleted} módulo(s)` };
            }
            break;
        case MissionType.LEARN_VOCABULARY:
            if (conditions.vocabularyLearned !== undefined) {
                innerCriteriaValue = { type: 'vocabulary_learned', value: conditions.vocabularyLearned, description: `Aprender ${conditions.vocabularyLearned} palabras nuevas` };
            }
            break;
        case MissionType.PARTICIPATE_FORUM:
            if (conditions.forumActivity !== undefined) {
                innerCriteriaValue = { type: 'forum_activity', value: conditions.forumActivity, description: `Realizar ${conditions.forumActivity} actividad(es) en el foro` };
            }
            break;
        case MissionType.EARN_POINTS:
            if (conditions.pointsSource !== undefined) {
                innerCriteriaValue = { type: 'points_earned_from_source', value: { amount: baseTargetValue, source: conditions.pointsSource }, description: `Ganar ${baseTargetValue} puntos de ${conditions.pointsSource}` };
            }
            break;
        case MissionType.PRACTICE_EXERCISES:
            if (conditions.exercises !== undefined) {
                innerCriteriaValue = { type: 'exercises_completed', value: conditions.exercises, description: `Completar ${conditions.exercises} ejercicios` };
            }
            break;
        // Añadir más casos para otros MissionType si es necesario
    }

    // Si no se encontró un mapeo específico, usar las condiciones directamente como valor genérico
    if (!innerCriteriaValue) {
        criteriaDescription = `Condición genérica para ${missionType}`;
        innerCriteriaValue = { type: missionType, value: conditions, description: criteriaDescription };
    } else {
        criteriaDescription = innerCriteriaValue.description; // Usar la descripción específica
    }

    return { type: missionType, value: innerCriteriaValue, description: criteriaDescription };
  }

  public async run(): Promise<void> {
    const missionRepository = this.dataSource.getRepository(Mission);
    const missionTemplateRepository = this.dataSource.getRepository(MissionTemplate);
    const badgeRepository = this.dataSource.getRepository(Badge);
    // const achievementRepository = this.dataSource.getRepository(Achievement); // Eliminado si no se usa

    const missionTemplates = await missionTemplateRepository.find();
    const badges = await badgeRepository.find();
    // const achievements = await achievementRepository.find(); // Eliminado si no se usa

    if (missionTemplates.length === 0) {
      console.log('No mission templates found. Skipping MissionSeeder.');
      return;
    }

    const missionsToSeed: Partial<Mission>[] = [];
    const now = new Date();

    // Crear una instancia de misión para cada plantilla de misión (definición global)
    for (const template of missionTemplates) {
        // Verificar si ya existe una misión para esta plantilla
        const existingMission = await missionRepository.findOne({
            where: { missionTemplate: { id: template.id } }
        });

        if (!existingMission) {
            // Determinar fechas de inicio y fin basadas en la frecuencia de la plantilla
            let startDate: Date;
            let endDate: Date;

            // Usar las fechas de la plantilla si están definidas, de lo contrario, calcular
            if (template.startDate && template.endDate) {
                startDate = new Date(template.startDate);
                endDate = new Date(template.endDate);
            } else {
                startDate = new Date(now);
                endDate = new Date(now);
                switch (template.frequency) {
                    case MissionFrequency.DIARIA:
                        endDate.setDate(now.getDate() + 1);
                        break;
                    case MissionFrequency.SEMANAL:
                        endDate.setDate(now.getDate() + 7);
                        break;
                    case MissionFrequency.MENSUAL:
                        endDate.setMonth(now.getMonth() + 1);
                        break;
                    case MissionFrequency.UNICA:
                        endDate.setFullYear(now.getFullYear() + 1);
                        break;
                    default:
                        endDate.setFullYear(now.getFullYear() + 1); // Por defecto para otros tipos
                        break;
                }
            }

            // Buscar la insignia de recompensa si se especifica en la plantilla
            let rewardBadgeEntity: Badge | undefined;
            if (template.rewards?.badge?.name) {
                rewardBadgeEntity = badges.find(b => b.name === template.rewards.badge.name);
                if (!rewardBadgeEntity) {
                    console.warn(`Badge "${template.rewards.badge.name}" not found for mission template "${template.title}".`);
                }
            }

            // Asegurar que bonusConditions.description sea siempre un string
            const processedBonusConditions = template.bonusConditions?.map(bc => ({
                condition: bc.condition,
                multiplier: bc.multiplier,
                description: bc.description || '', // Asegurar que description sea string
            }));

            const mission = {
                title: template.title,
                description: template.description,
                type: template.type,
                criteria: this.mapConditionsToCriteria(template.conditions, template.type, template.baseTargetValue), // Usar la función de mapeo y pasar baseTargetValue
                frequency: template.frequency,
                targetValue: template.baseTargetValue,
                rewardPoints: template.baseRewardPoints,
                rewardBadge: rewardBadgeEntity, // Asignar la entidad Badge
                startDate: startDate,
                endDate: endDate,
                completedBy: [],
                missionTemplateId: template.id, // Asignar la ID de la plantilla
                isActive: template.isActive,
                minLevel: template.minLevel,
                maxLevel: template.maxLevel,
                category: template.category,
                tags: template.tags,
                bonusConditions: processedBonusConditions,
                requirements: template.requirements,
                difficultyScaling: template.difficultyScaling,
            };
            missionsToSeed.push(mission);
        } else {
            console.log(`Mission for template "${template.title}" already exists. Skipping.`);
        }
    }

    // Save all mission instances in a single call
    await missionRepository.save(missionsToSeed);
    console.log(`Seeded ${missionsToSeed.length} mission instances.`);
    console.log('Mission seeder finished.');
  }
}
