import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward, RewardType } from '../../reward/entities/reward.entity';
import { User } from '../../user/entities/user.entity';
import { Gamification } from '../entities/gamification.entity';
import { Season, SeasonType } from '../entities/season.entity';
import { RewardStatus, UserReward } from '../entities/user-reward.entity';
import { BaseRewardService } from './base/base-reward.service';

@Injectable()
export class CulturalRewardService extends BaseRewardService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Reward)
        private readonly rewardRepository: Repository<Reward>,
        @InjectRepository(UserReward)
        private readonly userRewardRepository: Repository<UserReward>,
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>
    ) {
        super();
    }

    async calculateReward(user: User, action: string, metadata?: any): Promise<Reward> {
        const culturalReward = await this.rewardRepository.findOne({
            where: {
                type: RewardType.CULTURAL_ITEM,
                criteria: {
                    action: action
                }
            }
        });

        if (!culturalReward) {
            return null;
        }

        return culturalReward;
    }

    async validateRequirements(user: User, reward: Reward): Promise<boolean> {
        return this.validateRewardCriteria(user, reward.criteria);
    }

    async awardCulturalReward(userId: string, action: string, metadata?: any): Promise<UserReward> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['userAchievements']
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        const reward = await this.calculateReward(user, action, metadata);
        const meetsRequirements = await this.validateRequirements(user, reward);

        if (!meetsRequirements) {
            throw new Error('El usuario no cumple con los requisitos para esta recompensa');
        }

        const userReward = this.userRewardRepository.create({
            userId,
            rewardId: reward.id,
            status: RewardStatus.ACTIVE,
            dateAwarded: new Date(),
            expiresAt: this.getRewardExpiration(reward),
            metadata: {
                action,
                ...metadata
            }
        });

        await this.updateUserStats(user, reward);
        await this.userRepository.save(user);

        return this.userRewardRepository.save(userReward);
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

        // Otorgar puntos bonus
        gamification.points += reward.bonus;

        // Registrar logro cultural
        gamification.culturalAchievements = gamification.culturalAchievements || [];
        gamification.culturalAchievements.push({
            ...reward,
            achievedAt: new Date(),
            seasonType: season.type
        });

        // Registrar actividad
        gamification.recentActivities = gamification.recentActivities || [];
        gamification.recentActivities.unshift({
            type: 'cultural_achievement',
            description: `¡Has obtenido: ${reward.title}!`,
            pointsEarned: reward.bonus,
            timestamp: new Date()
        });

        await this.gamificationRepository.save(gamification);
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
        const specializations = Array.from(
            new Set(
                gamification.culturalAchievements
                    .map(achievement => achievement.culturalValue)
            )
        );

        return {
            totalAchievements: gamification.culturalAchievements.length,
            culturalValue,
            specializations
        };
    }
} 