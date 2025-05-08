import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CulturalAchievement } from '../entities/cultural-achievement.entity';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { Gamification } from '../entities/gamification.entity';
import { Season, SeasonType } from '../entities/season.entity';
import { RewardStatus, UserReward } from '../entities/user-reward.entity';
import { BaseRewardService } from './base/base-reward.service';
import { GamificationService } from './gamification.service';

@Injectable()
export class CulturalRewardService extends BaseRewardService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(CulturalAchievement)
        private readonly culturalAchievementRepository: Repository<CulturalAchievement>,
        @InjectRepository(UserReward)
        private readonly userRewardRepository: Repository<UserReward>,
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>,
        private readonly gamificationService: GamificationService,
    ) {
        super();
    }

    async calculateReward(user: User, achievementName: string, metadata?: any): Promise<CulturalAchievement> {
        const culturalReward = await this.culturalAchievementRepository.findOne({
            where: {
                name: achievementName
            }
        });

        if (!culturalReward) {
            return null;
        }

        return culturalReward;
    }

    async validateRequirements(user: User, achievement: CulturalAchievement): Promise<boolean> {
        return this.validateRewardCriteria(user, achievement.requirements);
    }

    async awardCulturalReward(userId: string, achievementName: string, metadata?: any): Promise<{userReward: UserReward, achievement: CulturalAchievement}> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['userAchievements']
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        const achievement = await this.calculateReward(user, achievementName, metadata);

        if (!achievement) {
             throw new NotFoundException(`Logro cultural con nombre "${achievementName}" no encontrado`);
        }

        const meetsRequirements = await this.validateRequirements(user, achievement);

        if (!meetsRequirements) {
            throw new Error('El usuario no cumple con los requisitos para esta recompensa');
        }

        const userReward = this.userRewardRepository.create({
            userId,
            rewardId: achievement.id,
            status: RewardStatus.ACTIVE,
            dateAwarded: new Date(),
            expiresAt: this.getRewardExpiration(achievement),
            metadata: {
                achievementName,
                ...metadata
            }
        });

        await this.updateUserStats(user, achievement);
        await this.userRepository.save(user);

        const savedReward = await this.userRewardRepository.save(userReward);
        return {
            userReward: savedReward,
            achievement
        };
    }

    async awardSeasonalReward(userId: string, season: Season, achievement: string): Promise<void> {
        const gamification = await this.gamificationRepository.findOne({
            where: { userId }
        });

        if (!gamification) return;

        const culturalRewards = {
            [SeasonType.BETSCNATE]: {
                'maestro_danza': {
                    title: 'Maestro de la Danza Tradicional',
                    description: 'Has dominado las danzas del Bëtscnaté',
                    culturalValue: 'Preservación de danzas tradicionales',
                    bonus: 500
                },
                'guardian_ritual': {
                    title: 'Guardián del Ritual',
                    description: 'Mantienes vivas las ceremonias del perdón',
                    culturalValue: 'Preservación de rituales',
                    bonus: 750
                }
            },
            [SeasonType.JAJAN]: {
                'sabio_plantas': {
                    title: 'Sabio de las Plantas Sagradas',
                    description: 'Conocedor profundo de la medicina tradicional',
                    culturalValue: 'Conocimiento medicinal ancestral',
                    bonus: 600
                }
            },
            [SeasonType.BENGBE_BETSA]: {
                'guia_espiritual': {
                    title: 'Guía Espiritual',
                    description: 'Guardián de las tradiciones espirituales',
                    culturalValue: 'Preservación espiritual',
                    bonus: 800
                }
            },
            [SeasonType.ANTEUAN]: {
                'narrador_ancestral': {
                    title: 'Narrador Ancestral',
                    description: 'Preservador de las historias de los mayores',
                    culturalValue: 'Preservación de la memoria histórica',
                    bonus: 1000
                }
            }
        };

        // Verificar si el logro existe para la temporada específica
        const seasonRewards = culturalRewards[season.type];
        if (!seasonRewards || !seasonRewards[achievement]) return;

        const reward = seasonRewards[achievement];

        // Otorgar puntos bonus y registrar actividad usando GamificationService
        if (reward.bonus > 0) {
            await this.gamificationService.awardPoints(
                userId,
                reward.bonus,
                'seasonal_reward', // Tipo de actividad
                `¡Has obtenido una recompensa estacional: ${reward.title}!` // Descripción
            );
        }

        // TODO: Implementar lógica para registrar el logro cultural si es necesario, posiblemente en CulturalAchievementService.
        // gamification.culturalAchievements = gamification.culturalAchievements || [];
        // gamification.culturalAchievements.push({
        //     ...reward,
        //     achievedAt: new Date(),
        //     seasonType: season.type
        // });

        // await this.gamificationRepository.save(gamification); // Guardar cambios en gamification si se modifica directamente
    }

    async getCulturalProgress(userId: string): Promise<{
        totalAchievements: number;
        culturalValue: number;
        specializations: string[];
    }> {
        const gamification = await this.gamificationRepository.findOne({
            where: { userId }
        });

        if (!gamification || !gamification.culturalAchievements) {
            return {
                totalAchievements: 0,
                culturalValue: 0,
                specializations: []
            };
        }

        // Calcular valor cultural basado en logros
        const culturalValue = gamification.culturalAchievements.length * 100;

        // Determinar especializaciones basadas en logros
        const specializations: string[] = Array.from(
            new Set(
                gamification.culturalAchievements
                    .map(achievement => achievement.culturalValue)
            )
        ) as string[];

        return {
            totalAchievements: gamification.culturalAchievements.length,
            culturalValue,
            specializations
        };
    }
}
