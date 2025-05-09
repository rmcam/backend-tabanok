import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Leaderboard } from '../../features/gamification/entities/leaderboard.entity';
import { LeaderboardType, LeaderboardCategory } from '../../features/gamification/enums/leaderboard.enum';

export default class LeaderboardSeeder extends DataSourceAwareSeed {
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

    const leaderboards = [
      {
        type: LeaderboardType.DAILY,
        category: LeaderboardCategory.POINTS,
        startDate: yesterday,
        endDate: today,
        rankings: [
          { userId: 'fictional-user-id-1', name: 'Usuario1', score: 150, achievements: [], rank: 1, change: 0 },
          { userId: 'fictional-user-id-2', name: 'Usuario2', score: 120, achievements: [], rank: 2, change: 0 },
        ],
        rewards: [
          { rank: 1, points: 50, badge: { id: 'badge-id-1', name: 'Medalla Diaria', icon: 'icon-url' } },
          { rank: 2, points: 30 },
        ],
      },
      {
        type: LeaderboardType.WEEKLY,
        category: LeaderboardCategory.LESSONS_COMPLETED,
        startDate: lastWeek,
        endDate: today,
        rankings: [
          { userId: 'fictional-user-id-1', name: 'Usuario1', score: 10, achievements: [], rank: 1, change: 0 },
          { userId: 'fictional-user-id-3', name: 'Usuario3', score: 8, achievements: [], rank: 2, change: 0 },
        ],
        rewards: [
          { rank: 1, points: 100, badge: { id: 'badge-id-2', name: 'Campeón Semanal', icon: 'icon-url' } },
          { rank: 2, points: 60 },
        ],
      },
      {
        type: LeaderboardType.MONTHLY,
        category: LeaderboardCategory.CULTURAL_CONTRIBUTIONS,
        startDate: lastMonth,
        endDate: today,
        rankings: [
          { userId: 'fictional-user-id-3', name: 'Usuario3', score: 5, achievements: [], rank: 1, change: 0 },
          { userId: 'fictional-user-id-2', name: 'Usuario2', score: 3, achievements: [], rank: 2, change: 0 },
        ],
        rewards: [
          { rank: 1, points: 200, badge: { id: 'badge-id-3', name: 'Embajador Cultural', icon: 'icon-url' } },
          { rank: 2, points: 120 },
        ],
      },
    ];

    const moreLeaderboards = [
      {
        type: LeaderboardType.WEEKLY,
        category: LeaderboardCategory.EXERCISES_COMPLETED,
        startDate: lastWeek,
        endDate: today,
        rankings: [
          { userId: 'fictional-user-id-4', name: 'Usuario4', score: 25, achievements: [], rank: 1, change: 0 },
          { userId: 'fictional-user-id-1', name: 'Usuario1', score: 20, achievements: [], rank: 2, change: 0 },
          { userId: 'fictional-user-id-2', name: 'Usuario2', score: 18, achievements: [], rank: 3, change: 0 },
        ],
        rewards: [
          { rank: 1, points: 80 },
          { rank: 2, points: 50 },
          { rank: 3, points: 30 },
        ],
      },
      {
        type: LeaderboardType.MONTHLY,
        category: LeaderboardCategory.PERFECT_SCORES,
        startDate: lastMonth,
        endDate: today,
        rankings: [
          { userId: 'fictional-user-id-1', name: 'Usuario1', score: 12, achievements: [], rank: 1, change: 0 },
          { userId: 'fictional-user-id-3', name: 'Usuario3', score: 9, achievements: [], rank: 2, change: 0 },
        ],
        rewards: [
          { rank: 1, points: 150 },
          { rank: 2, points: 100 },
        ],
      },
    ];

    leaderboards.push(...moreLeaderboards);

    for (const leaderboardData of leaderboards) {
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
        const leaderboard = repository.create(leaderboardData);
        await repository.save(leaderboard);
        console.log(`Leaderboard "${leaderboardData.type} - ${leaderboardData.category}" seeded.`);
      } else {
        console.log(`Leaderboard "${existingLeaderboard.type} - ${existingLeaderboard.category}" already exists. Skipping.`);
      }
    }
  }
}
