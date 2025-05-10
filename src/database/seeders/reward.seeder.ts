import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Reward } from '../../features/reward/entities/reward.entity';
import { RewardType, RewardTrigger } from '../../common/enums/reward.enum'; // Importar RewardType y RewardTrigger enum
import { Badge } from '../../features/gamification/entities/badge.entity'; // Importar la entidad Badge
import { Achievement } from '../../features/gamification/entities/achievement.entity'; // Importar la entidad Achievement

// Define an interface for the reward data objects to include optional properties
interface RewardData {
    name: string;
    title: string;
    description: string;
    type: RewardType;
    trigger: RewardTrigger;
    pointsCost: number;
    rewardValue: any; // Use any for flexibility in rewardValue structure
    isLimited: boolean;
    limitedQuantity?: number; // Optional
    startDate?: Date; // Optional
    endDate?: Date; // Optional
    isSecret: boolean;
    isActive: boolean;
    expirationDays?: number; // Optional
    criteria?: any; // Optional
    conditions?: any; // Optional
    isSpecial?: boolean; // Optional
}


export class RewardSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const rewardRepository = this.dataSource.getRepository(Reward);
    const badgeRepository = this.dataSource.getRepository(Badge); // Obtener el repositorio de Badge
    const achievementRepository = this.dataSource.getRepository(Achievement); // Obtener el repositorio de Achievement

    // El truncado ahora se maneja centralmente en seed.ts
    // console.log("Table 'rewards' should have been truncated by seed.ts");

    // Obtener medallas y logros existentes para asociar
    const badges = await badgeRepository.find();
    const achievements = await achievementRepository.find();

    const rewardsToSeed: RewardData[] = [ // Use the defined interface
      // Recompensas de Puntos
      {
        name: 'Puntos por Lección',
        title: 'Puntos por Lección Completada',
        description: 'Gana puntos al finalizar una lección.',
        type: RewardType.POINTS,
        trigger: RewardTrigger.LESSON_COMPLETION,
        pointsCost: 0,
        rewardValue: { type: 'points', value: 50 },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },
      {
        name: 'Puntos por Ejercicio',
        title: 'Puntos por Ejercicio Correcto',
        description: 'Obtén puntos por responder correctamente a un ejercicio.',
        type: RewardType.POINTS,
        trigger: RewardTrigger.EXERCISE_COMPLETION, // Corregido
        pointsCost: 0,
        rewardValue: { type: 'points', value: 20 },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },
      {
        name: 'Bonificación Diaria',
        title: 'Bonificación por Racha Diaria',
        description: 'Recompensa por mantener tu racha de aprendizaje diaria.',
        type: RewardType.POINTS,
        trigger: RewardTrigger.LESSON_COMPLETION, // Using a valid trigger
        pointsCost: 0,
        rewardValue: { type: 'points', value: 100 },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },
      {
        name: 'Puntos por Contribución',
        title: 'Puntos por Contribución Cultural',
        description: 'Gana puntos al compartir contenido cultural.',
        type: RewardType.POINTS,
        trigger: RewardTrigger.LESSON_COMPLETION, // Using a valid trigger
        pointsCost: 0,
        rewardValue: { type: 'points', value: 75 },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },

      // Recompensas de Medallas (BADGE)
      {
        name: 'Medalla: Aprendiz de Bronce',
        title: 'Medalla: Aprendiz de Bronce',
        description: 'Otorgada por completar las primeras unidades.',
        type: RewardType.BADGE,
        trigger: RewardTrigger.LESSON_COMPLETION,
        pointsCost: 0,
        rewardValue: { type: 'badge', value: 'Aprendiz de Bronce', imageUrl: '/images/badges/aprendiz_bronce.png' }, // Nombre de la medalla y URL de imagen
        isLimited: false,
        isSecret: false,
        isActive: true,
      },
      {
        name: 'Medalla: Explorador de Unidades',
        title: 'Medalla: Explorador de Unidades',
        description: 'Otorgada por completar todas las unidades de un módulo.',
        type: RewardType.BADGE,
        trigger: RewardTrigger.LESSON_COMPLETION, // Using a valid trigger
        pointsCost: 0,
        rewardValue: { type: 'badge', value: 'Explorador de Unidades', imageUrl: '/images/badges/explorador_unidades.png' },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },
      {
        name: 'Medalla: Colaborador Activo',
        title: 'Medalla: Colaborador Activo',
        description: 'Otorgada por participar activamente en la comunidad.',
        type: RewardType.BADGE,
        trigger: RewardTrigger.LESSON_COMPLETION, // Using a valid trigger
        pointsCost: 0,
        rewardValue: { type: 'badge', value: 'Colaborador de Plata', imageUrl: '/images/badges/colaborador_activo.png' },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },

      // Recompensas de Logros (ACHIEVEMENT)
      {
        name: 'Logro: Maestro del Alfabeto',
        title: 'Logro: Maestro del Alfabeto',
        description: 'Alcanza la maestría en el alfabeto Kamëntsá.',
        type: RewardType.ACHIEVEMENT,
        trigger: RewardTrigger.LEVEL_UP, // Using a valid trigger
        pointsCost: 0,
        rewardValue: { type: 'achievement', value: 'Logro: Maestro del Alfabeto' }, // Nombre del logro
        isLimited: false,
        isSecret: false,
        isActive: true,
      },
      {
        name: 'Logro: Experto en Vocabulario',
        title: 'Logro: Experto en Vocabulario',
        description: 'Domina un amplio vocabulario en Kamëntsá.',
        type: RewardType.ACHIEVEMENT,
        trigger: RewardTrigger.LEVEL_UP, // Using a valid trigger
        pointsCost: 0,
        rewardValue: { type: 'achievement', value: 'Logro: Experto en Vocabulario' },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },
      {
        name: 'Logro: Nivel de Fluidez Avanzado',
        title: 'Logro: Nivel de Fluidez Avanzado',
        description: 'Alcanza un alto nivel de fluidez en el idioma.',
        type: RewardType.ACHIEVEMENT,
        trigger: RewardTrigger.LEVEL_UP,
        pointsCost: 0,
        rewardValue: { type: 'achievement', value: 'Logro: Nivel de Fluidez Avanzado' },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },

      // Recompensas de Descuento (DISCOUNT)
      {
        name: 'Descuento 10%',
        title: '10% de Descuento en la Tienda',
        description: 'Obtén un 10% de descuento en cualquier compra.',
        type: RewardType.DISCOUNT,
        trigger: RewardTrigger.LEVEL_UP, // Using a valid trigger
        pointsCost: 500,
        rewardValue: { type: 'discount', value: 10 },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },
      {
        name: 'Descuento 25%',
        title: '25% de Descuento en la Tienda',
        description: 'Obtén un 25% de descuento en cualquier compra.',
        type: RewardType.DISCOUNT,
        trigger: RewardTrigger.LEVEL_UP,
        pointsCost: 1500,
        rewardValue: { type: 'discount', value: 25 },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },

      // Recompensas de Contenido Exclusivo (EXCLUSIVE_CONTENT)
      {
        name: 'Contenido Exclusivo: Mitos',
        title: 'Acceso a Mitos y Leyendas Inéditas',
        description: 'Desbloquea una colección de mitos y leyendas Kamëntsá no disponibles públicamente.',
        type: RewardType.EXCLUSIVE_CONTENT,
        trigger: RewardTrigger.LEVEL_UP, // Using a valid trigger
        pointsCost: 750,
        rewardValue: { type: 'content', value: 'uuid-de-contenido-mitos' }, // ID de contenido ficticio
        isLimited: false,
        isSecret: true, // Contenido secreto hasta que se desbloquea
        isActive: true,
      },

      // Recompensas de Personalización (CUSTOMIZATION)
      {
        name: 'Título Personalizado: Explorador',
        title: 'Título de Perfil: Explorador Kamëntsá',
        description: 'Desbloquea el título "Explorador Kamëntsá" para tu perfil.',
        type: RewardType.CUSTOMIZATION,
        trigger: RewardTrigger.LEVEL_UP,
        pointsCost: 1000,
        rewardValue: { type: 'customization', value: { customizationType: 'profile_title', customizationValue: 'Explorador Kamëntsá' } },
        isLimited: false,
        isSecret: false,
        isActive: true,
      },

      // Recompensas Culturales (CULTURAL)
      {
        name: 'Acceso a Taller Cultural',
        title: 'Acceso a Taller de Artesanía',
        description: 'Obtén acceso a un taller virtual sobre artesanía tradicional Kamëntsá.',
        type: RewardType.CULTURAL,
        trigger: RewardTrigger.LEVEL_UP, // Using a valid trigger
        pointsCost: 2000,
        rewardValue: { type: 'cultural', value: { eventName: 'Taller de Artesanía', date: '2025-08-15T10:00:00Z', platform: 'Zoom' } }, // Detalles del evento cultural
        isLimited: true, // Puede ser limitado por fecha o cupo
        limitedQuantity: 50,
        startDate: new Date('2025-08-01T00:00:00Z'),
        endDate: new Date('2025-08-14T23:59:59Z'),
        isSecret: false,
        isActive: true,
      },

      // Recompensas de Experiencia (EXPERIENCE)
      {
        name: 'Multiplicador de Experiencia',
        title: 'Multiplicador de Experiencia (2x)',
        description: 'Gana el doble de puntos de experiencia por un tiempo limitado.',
        type: RewardType.EXPERIENCE,
        trigger: RewardTrigger.LEVEL_UP, // Using a valid trigger
        pointsCost: 800,
        rewardValue: { type: 'experience', value: { multiplier: 2.0, durationHours: 24 } }, // Multiplicador y duración
        isLimited: false,
        isSecret: false,
        isActive: true,
        expirationDays: 7, // Expira 7 días después de ser reclamado
      },

      // Recompensas de Contenido (CONTENT) - Similar a EXCLUSIVE_CONTENT pero puede ser contenido público
       {
        name: 'Guía de Pronunciación',
        title: 'Guía Detallada de Pronunciación',
        description: 'Desbloquea una guía avanzada sobre la fonética Kamëntsá.',
        type: RewardType.CONTENT,
        trigger: RewardTrigger.LEVEL_UP, // Using a valid trigger
        pointsCost: 300,
        rewardValue: { type: 'content', value: 'uuid-de-guia-pronunciacion' }, // ID de contenido ficticio
        isLimited: false,
        isSecret: false,
        isActive: true,
      },

      // Recompensa Limitada por Tiempo
      {
        name: 'Bonificación de Verano',
        title: 'Bonificación de Puntos de Verano',
        description: 'Gana puntos extra durante el evento de verano.',
        type: RewardType.POINTS,
        trigger: RewardTrigger.LESSON_COMPLETION, // Using a valid trigger
        pointsCost: 0,
        rewardValue: { type: 'points', value: 150 },
        isLimited: true,
        startDate: new Date('2025-07-01T00:00:00Z'),
        endDate: new Date('2025-08-31T23:59:59Z'),
        isSecret: false,
        isActive: true,
      },
    ];


    for (const rewardData of rewardsToSeed) {
      const existingReward = await rewardRepository.findOne({ where: { name: rewardData.name } });

      if (!existingReward) {
        // Construir el objeto rewardValue basado en el tipo de recompensa
        let rewardValueObject: Record<string, any> = { type: rewardData.type };

        switch (rewardData.type) {
            case RewardType.BADGE:
                // Buscar la medalla por nombre y almacenar su ID en rewardValue
                const associatedBadge = badges.find(b => b.name === rewardData.rewardValue.value);
                if (associatedBadge) {
                    rewardValueObject.value = associatedBadge.id;
                    rewardValueObject.imageUrl = rewardData.rewardValue.imageUrl; // Incluir imageUrl en rewardValue
                } else {
                    console.warn(`Badge with name "${rewardData.rewardValue.value}" not found for Reward "${rewardData.name}". Skipping seeding this reward.`);
                    continue; // Skip seeding this reward if badge not found
                }
                break;
            case RewardType.ACHIEVEMENT:
                const associatedAchievement = achievements.find(a => a.name === rewardData.rewardValue.value);
                if (associatedAchievement) {
                    rewardValueObject.value = associatedAchievement.id;
                } else {
                    console.warn(`Achievement with name "${rewardData.rewardValue.value}" not found for Reward "${rewardData.name}". Skipping seeding this reward.`);
                    continue; // Skip seeding this reward if achievement not found
                }
                break;
            case RewardType.POINTS:
                rewardValueObject.value = rewardData.rewardValue.value; // La cantidad de puntos
                break;
            case RewardType.DISCOUNT:
                rewardValueObject.value = rewardData.rewardValue.value; // El porcentaje de descuento
                break;
            case RewardType.EXCLUSIVE_CONTENT:
                rewardValueObject.value = rewardData.rewardValue.value; // El ID del contenido
                break;
            case RewardType.CUSTOMIZATION:
                rewardValueObject.value = rewardData.rewardValue.value; // El objeto de personalización
                break;
            // Añadir casos para otros tipos de recompensa si es necesario (CULTURAL, EXPERIENCE, CONTENT)
            case RewardType.CULTURAL:
            case RewardType.EXPERIENCE:
            case RewardType.CONTENT:
                 rewardValueObject.value = rewardData.rewardValue.value; // Asumir que el valor es un ID o referencia
                 break;
            default:
                console.warn(`Unknown RewardType "${rewardData.type}" for Reward "${rewardData.name}". rewardValue may be incomplete.`);
                break;
        }


        const newReward = rewardRepository.create({
            name: rewardData.name,
            title: rewardData.title,
            description: rewardData.description,
            type: rewardData.type,
            trigger: rewardData.trigger,
            pointsCost: rewardData.pointsCost,
            criteria: rewardData.criteria, // Include criteria
            conditions: rewardData.conditions, // Include conditions
            rewardValue: rewardValueObject, // Asignar el objeto rewardValue construido
            isLimited: rewardData.isLimited,
            limitedQuantity: rewardData.limitedQuantity,
            startDate: rewardData.startDate,
            endDate: rewardData.endDate,
            isSecret: rewardData.isSecret,
            isActive: rewardData.isActive,
            expirationDays: rewardData.expirationDays,
            // No incluir propiedades temporales como associatedBadgeName, associatedAchievementName, imageUrl (si se maneja en rewardValue)
        });
        try {
            const savedReward = await rewardRepository.save(newReward);
            console.log(`Reward "${savedReward.name}" seeded with ID: ${savedReward.id}. Type: ${savedReward.type}.`); // Added more detailed log
        } catch (error) {
            console.error(`Error seeding reward "${rewardData.name}":`, error);
        }
      } else {
        console.log(`Reward "${existingReward.name}" already exists. Skipping seeding.`); // Modified log message
      }
    }
    console.log('Reward seeder finished.'); // Added log
  }
}
