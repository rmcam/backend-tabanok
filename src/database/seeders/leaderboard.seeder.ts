import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Leaderboard } from '../../features/gamification/entities/leaderboard.entity';
import { LeaderboardType, LeaderboardCategory } from '../../features/gamification/enums/leaderboard.enum';

export class LeaderboardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Leaderboard);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    const leaderboardsToSeed = [
      {
        type: LeaderboardType.DAILY,
        category: LeaderboardCategory.POINTS,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1), // Ayer
        endDate: today, // Hoy
        rankings: [], // Vacío, se llenará dinámicamente
        rewards: [], // Vacío, se llenará dinámicamente
      },
      {
        type: LeaderboardType.WEEKLY,
        category: LeaderboardCategory.LESSONS_COMPLETED,
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7), // Hace una semana
        endDate: today, // Hoy
        rankings: [],
        rewards: [],
      },
      {
        type: LeaderboardType.MONTHLY,
        category: LeaderboardCategory.CULTURAL_CONTRIBUTIONS,
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()), // Hace un mes
        endDate: today, // Hoy
        rankings: [],
        rewards: [],
      },
    ];

    for (const leaderboardData of leaderboardsToSeed) {
      // Verificar si ya existe una tabla de clasificación con el mismo tipo, categoría y rango de fechas
      const existingLeaderboard = await repository.findOne({
        where: {
          type: leaderboardData.type,
          category: leaderboardData.category,
          startDate: leaderboardData.startDate,
          endDate: leaderboardData.endDate,
        },
      });

      if (!existingLeaderboard) {
        const leaderboard = repository.create({
          ...leaderboardData,
        });
        await repository.save(leaderboard);
        console.log(`Leaderboard "${leaderboardData.type} - ${leaderboardData.category}" seeded.`);
      } else {
        console.log(`Leaderboard "${existingLeaderboard.type} - ${existingLeaderboard.category}" already exists. Skipping.`);
      }
    }
  }
}
