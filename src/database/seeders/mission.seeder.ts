import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Mission, MissionFrequency, MissionType } from '../../features/gamification/entities/mission.entity';

export default class MissionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Mission);

    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + 7);

    const missions = [
      {
        title: 'Completa tu primera lección diaria',
        description: 'Termina una lección hoy para ganar puntos.',
        type: MissionType.COMPLETE_LESSONS,
        criteria: { type: 'count', value: 1, description: 'Número de lecciones completadas' },
        frequency: MissionFrequency.DAILY,
        targetValue: 1,
        rewardPoints: 20,
        startDate: now,
        endDate: futureDate,
        completedBy: [],
        // season: 'fictional-season-id-1', // Asociar a una temporada ficticia por ahora
      },
      {
        title: 'Practica ejercicios de vocabulario',
        description: 'Completa 5 ejercicios de vocabulario esta semana.',
        type: MissionType.PRACTICE_EXERCISES,
        criteria: { type: 'category', value: 'vocabulary', description: 'Categoría de ejercicio' },
        frequency: MissionFrequency.WEEKLY,
        targetValue: 5,
        rewardPoints: 50,
        rewardBadge: { id: 'badge-id-4', name: 'Practicante Constante', icon: 'icon-url' },
        startDate: now,
        endDate: futureDate,
        completedBy: [],
        // season: 'fictional-season-id-1', // Asociar a una temporada ficticia por ahora
      },
      {
        title: 'Gana puntos de colaboración',
        description: 'Obtén 100 puntos a través de colaboraciones este mes.',
        type: MissionType.EARN_POINTS,
        criteria: { type: 'source', value: 'collaboration', description: 'Fuente de puntos' },
        frequency: MissionFrequency.MONTHLY,
        targetValue: 100,
        rewardPoints: 150,
        startDate: now,
        endDate: futureDate,
        completedBy: [],
        // season: 'fictional-season-id-2', // Asociar a una temporada ficticia por ahora
      },
      {
        title: 'Completa ejercicios de gramática',
        description: 'Termina 3 ejercicios de gramática esta semana.',
        type: MissionType.PRACTICE_EXERCISES,
        criteria: { type: 'category', value: 'grammar', description: 'Categoría de ejercicio' },
        frequency: MissionFrequency.WEEKLY,
        targetValue: 3,
        rewardPoints: 40,
        startDate: now,
        endDate: futureDate,
        completedBy: [],
      },
      {
        title: 'Aprende 10 palabras nuevas',
        description: 'Añade 10 palabras nuevas a tu vocabulario personal este mes.',
        type: MissionType.LEARN_VOCABULARY,
        criteria: { type: 'count', value: 10, description: 'Número de palabras aprendidas' },
        frequency: MissionFrequency.MONTHLY,
        targetValue: 10,
        rewardPoints: 75,
        startDate: now,
        endDate: futureDate,
        completedBy: [],
      },
      {
        title: 'Participa en el foro',
        description: 'Realiza al menos una publicación o comentario en el foro hoy.',
        type: MissionType.PARTICIPATE_FORUM,
        criteria: { type: 'count', value: 1, description: 'Número de interacciones en el foro' },
        frequency: MissionFrequency.DAILY,
        targetValue: 1,
        rewardPoints: 15,
        startDate: now,
        endDate: futureDate,
        completedBy: [],
      },
    ];

    for (const missionData of missions) {
      const mission = repository.create(missionData);
      await repository.save(mission);
    }
  }
}
