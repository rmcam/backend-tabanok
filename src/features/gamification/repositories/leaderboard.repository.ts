import { EntityRepository, Repository, Between } from 'typeorm';
import { Leaderboard } from '../entities/leaderboard.entity';
import { LeaderboardType, LeaderboardCategory } from '../enums/leaderboard.enum';

@EntityRepository(Leaderboard)
export class LeaderboardRepository extends Repository<Leaderboard> {
  async findActiveByTypeAndCategory(
    type: LeaderboardType,
    category: LeaderboardCategory
  ): Promise<Leaderboard> {
    const now = new Date();
    return this.findOne({
      where: {
        type,
        category,
        startDate: Between(now, now)
      },
      relations: ['user']
    });
  }

  async updateUserRanking(
    leaderboardId: string,
    userId: string,
    score: number,
    achievements: string[]
  ): Promise<void> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      const leaderboard = await transactionalEntityManager.findOne(Leaderboard, {
        where: { id: leaderboardId }
      });

      if (!leaderboard) {
        throw new Error('Leaderboard not found');
      }

      const rankings = leaderboard.rankings || [];
      const userIndex = rankings.findIndex(r => r.userId === userId);

      if (userIndex >= 0) {
        rankings[userIndex] = {
          ...rankings[userIndex],
          score,
          achievements
        };
      } else {
        rankings.push({
          userId,
          name: '', // Se completará con join desde servicio
          score,
          achievements,
          rank: 0, // Se calculará después
          change: 0
        });
      }

      await transactionalEntityManager.update(Leaderboard, leaderboardId, {
        rankings
      });
    });
  }

  async calculateRanks(leaderboardId: string): Promise<void> {
    const leaderboard = await this.findOne({ where: { id: leaderboardId } });
    if (!leaderboard) {
      throw new Error('Leaderboard not found');
    }

    const sorted = [...leaderboard.rankings].sort((a, b) => b.score - a.score);
    const ranked = sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
      change: 0 // TODO: Implementar cálculo de cambio vs ranking anterior
    }));

    await this.update(leaderboardId, { rankings: ranked });
  }
}
