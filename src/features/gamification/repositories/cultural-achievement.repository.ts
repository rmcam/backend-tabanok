import { EntityRepository, Repository } from 'typeorm';
import { CulturalAchievement } from '../entities/cultural-achievement.entity';

@EntityRepository(CulturalAchievement)
export class CulturalAchievementRepository extends Repository<CulturalAchievement> {}
