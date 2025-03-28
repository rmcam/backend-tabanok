import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../entities/gamification.entity';
import { Season, SeasonType } from '../entities/season.entity';

@Injectable()
export class CulturalRewardService {
    constructor(
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>
    ) { }

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

        const reward = culturalRewards[season.type]?.[achievement];
        if (!reward) return;

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