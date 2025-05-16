import { v4 as uuidv4 } from 'uuid'; // Importar uuidv4
import { DataSource } from 'typeorm';
import { Achievement } from '../../features/gamification/entities/achievement.entity';
import { Badge } from '../../features/gamification/entities/badge.entity'; // Importar la entidad Badge
import { DataSourceAwareSeed } from './data-source-aware-seed';

// Define an interface for the achievement data objects with a simplified requirement type
interface AchievementData {
    name: string;
    description: string;
    iconUrl: string;
    criteria: string;
    requirement: number; // Requirement is strictly a number
    bonusPoints: number;
    badgeName?: string | null; // Optional badge name
    isSecret?: boolean; // Optional
    isSpecial?: boolean; // Optional
    criteriaDetails?: any; // Optional field for complex criteria details
}


export class AchievementSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const achievementRepository = this.dataSource.getRepository(Achievement);
    const badgeRepository = this.dataSource.getRepository(Badge); // Obtener el repositorio de Badge

    // Obtener las medallas existentes para asociarlas a los logros
    const badges = await badgeRepository.find();

    const achievementsToSeed: AchievementData[] = [ // Use the defined interface
      // Logros de Aprendizaje
      {
        name: 'Logro: Primeros Pasos',
        description: 'Completa tu primera lección.',
        iconUrl: '/icons/achievements/primeros_pasos.png',
        criteria: 'lessons_completed',
        requirement: 1,
        bonusPoints: 50,
        badgeName: 'Aprendiz de Bronce', // Referenciar la medalla por nombre
      },
      {
        name: 'Logro: Explorador de Unidades',
        description: 'Completa todas las unidades de un módulo.',
        iconUrl: '/icons/achievements/explorador_unidades.png',
        criteria: 'modules_completed', // Criterio basado en módulos
        requirement: 1, // Completa 1 módulo
        bonusPoints: 100,
        badgeName: 'Explorador de Unidades', // Asociar a la medalla Explorador de Unidades
      },
      {
        name: 'Logro: Maestro de Actividades',
        description: 'Completa 20 actividades con una puntuación promedio de 80% o más.',
        iconUrl: '/icons/achievements/maestro_actividades.png',
        criteria: 'activities_completed_with_score', // Criterio combinado
        requirement: 20, // Store count as number
        bonusPoints: 150,
        badgeName: 'Maestro de Oro', // Asociar a Maestro de Oro
      },
      {
        name: 'Logro: Experto en Vocabulario',
        description: 'Aprende 100 palabras nuevas.',
        iconUrl: '/icons/achievements/experto_vocabulario.png',
        criteria: 'vocabulary_learned',
        requirement: 100,
        bonusPoints: 180,
        badgeName: 'Explorador de Unidades', // Asociar a Experto en Vocabulario
      },
      {
        name: 'Logro: Gramático Avanzado',
        description: 'Completa todos los ejercicios de gramática avanzada.',
        iconUrl: '/icons/achievements/gramatico_avanzado.png',
        criteria: 'exercises_completed_by_topic', // Criterio basado en tema
        requirement: 1, // Generic number requirement
        bonusPoints: 200,
        badgeName: null,
      },
      {
        name: 'Logro: Maestro del Alfabeto',
        description: 'Alcanza la maestría en el alfabeto Kamëntsá.',
        iconUrl: '/icons/achievements/maestro_alfabeto.png',
        criteria: 'alphabet_mastery',
        requirement: 1,
        bonusPoints: 100,
        badgeName: null,
      },
      {
        name: 'Logro: Nivel de Fluidez Avanzado',
        description: 'Alcanza un alto nivel de fluidez en el idioma.',
        iconUrl: '/icons/achievements/fluidez_avanzado.png',
        criteria: 'fluency_level',
        requirement: 1,
        bonusPoints: 300,
        badgeName: null,
      },

      // Logros de Racha
      {
        name: 'Logro: Racha Imparable',
        description: 'Mantén una racha de 30 días de actividad.',
        iconUrl: '/icons/achievements/racha_imparable.png',
        criteria: 'streak_reached',
        requirement: 30,
        bonusPoints: 200,
        badgeName: 'Racha Imparable', // Asociar a Racha Imparable
      },
      {
        name: 'Logro: Super Racha',
        description: 'Mantén una racha de 90 días de actividad.',
        iconUrl: '/icons/achievements/super_racha.png',
        criteria: 'streak_reached',
        requirement: 90,
        bonusPoints: 300,
        badgeName: 'Super Racha', // Asociar a Super Racha
      },

      // Logros de Comunidad y Colaboración
      {
        name: 'Logro: Colaborador Activo',
        description: 'Realiza 10 contribuciones validadas (comentarios, sugerencias).',
        iconUrl: '/icons/achievements/colaborador_activo.png',
        criteria: 'contributions_validated',
        requirement: 10,
        bonusPoints: 250,
        badgeName: 'Colaborador de Plata', // Asociar a Colaborador de Plata
      },
      {
        name: 'Logro: Mentor de la Comunidad',
        description: 'Ayuda a otros 5 usuarios en los foros o comentarios.',
        iconUrl: '/icons/achievements/mentor_comunidad.png',
        criteria: 'users_helped',
        requirement: 5,
        bonusPoints: 300,
        badgeName: 'Mentor de Oro', // Asociar a Mentor de Oro
      },

      // Logros Culturales
      {
        name: 'Logro: Embajador Cultural',
        description: 'Participa en 3 eventos culturales o contribuye con contenido cultural.',
        iconUrl: '/icons/achievements/embajador_cultural.png',
        criteria: 'cultural_engagement', // Criterio más general
        requirement: 3,
        bonusPoints: 280,
        badgeName: 'Embajador Cultural', // Asociar a Embajador Cultural
      },

      // Logros Especiales o Secretos
      {
        name: 'Logro: Descubridor de Mitos',
        description: 'Desbloquea el contenido exclusivo de Mitos y Leyendas.',
        iconUrl: '/icons/achievements/descubridor_mitos.png',
        criteria: 'exclusive_content_unlocked',
        requirement: 1, // Generic number requirement
        bonusPoints: 200,
        badgeName: null,
        isSecret: true, // Logro secreto
      },
      {
        name: 'Logro: Fundador de Tabanok',
        description: 'Sé uno de los primeros usuarios de la plataforma.',
        iconUrl: '/icons/achievements/fundador.png',
        criteria: 'user_creation_date', // Criterio basado en fecha de creación de usuario
        requirement: 1, // Generic number requirement
        bonusPoints: 500,
        badgeName: 'Insignia de Fundador', // Asociar a Insignia de Fundador
        isSpecial: true, // Logro especial
      },
    ];

    const achievementsToInsert = await Promise.all(achievementsToSeed.map(async (achievementData) => {
        const existingAchievement = await achievementRepository.findOne({ where: { name: achievementData.name } });

        if (!existingAchievement) {
            // Buscar la medalla por nombre
            const badge = achievementData.badgeName
                ? badges.find(b => b.name === achievementData.badgeName)
                : null;

            if (achievementData.badgeName && !badge) {
                console.warn(`Badge with name "${achievementData.badgeName}" not found. Achievement "${achievementData.name}" will be seeded without a badge.`);
            }

            return achievementRepository.create({
                id: uuidv4(), // Assign a generated UUID
                name: achievementData.name,
                description: achievementData.description,
                iconUrl: achievementData.iconUrl,
                criteria: achievementData.criteria,
                requirement: achievementData.requirement,
                bonusPoints: achievementData.bonusPoints,
                badge: badge ? { id: badge.id, name: badge.name, iconUrl: badge.iconUrl } : null,
                isSecret: achievementData.isSecret || false, // Include isSecret, default to false
                isSpecial: achievementData.isSpecial || false, // Include isSpecial, default to false
            });
        } else {
            console.log(`Achievement "${existingAchievement.name}" already exists. Skipping.`);
            return null; // Return null for existing achievements
        }
    }));

    // Filter out null values (existing achievements)
    const newAchievementsToInsert = achievementsToInsert.filter(achievement => achievement !== null) as Achievement[];


    // Save all new achievements in a single call
    await achievementRepository.save(newAchievementsToInsert);
    console.log(`Seeded ${newAchievementsToInsert.length} new achievements.`);
  }
}
