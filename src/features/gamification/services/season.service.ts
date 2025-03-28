import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { MissionFrequency, MissionType } from '../entities/mission.entity';
import { Season, SeasonType } from '../entities/season.entity';
import { MissionService } from './mission.service';

@Injectable()
export class SeasonService {
    constructor(
        @InjectRepository(Season)
        private seasonRepository: Repository<Season>,
        private missionService: MissionService
    ) { }

    async createSeason(seasonData: Partial<Season>): Promise<Season> {
        const season = this.seasonRepository.create(seasonData);
        return this.seasonRepository.save(season);
    }

    async getCurrentSeason(): Promise<Season> {
        const now = new Date();
        const currentSeason = await this.seasonRepository.findOne({
            where: {
                startDate: LessThanOrEqual(now),
                endDate: MoreThanOrEqual(now),
                isActive: true
            },
            relations: ['missions']
        });

        if (!currentSeason) {
            throw new NotFoundException('No hay una temporada activa actualmente');
        }

        return currentSeason;
    }

    async generateBetscnateSeason(): Promise<Season> {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 42); // 6 semanas

        const season = await this.createSeason({
            type: SeasonType.BETSCNATE,
            name: 'Temporada del Bëtscnaté',
            description: 'Celebración del Carnaval Kamëntsá con misiones relacionadas a música, danza y rituales tradicionales',
            startDate,
            endDate,
            culturalElements: {
                traditions: ['Danza tradicional', 'Música ritual', 'Ceremonias de perdón'],
                vocabulary: ['Bëtscnaté', 'Música', 'Danza', 'Ritual'],
                stories: ['Historia del Carnaval', 'Significado del perdón']
            },
            rewards: {
                points: 1000,
                specialBadge: 'Maestro del Bëtscnaté',
                culturalItems: ['Máscara tradicional', 'Vestimenta ceremonial']
            }
        });

        await this.generateSeasonMissions(season);
        return season;
    }

    async generateJajanSeason(): Promise<Season> {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 90); // 3 meses

        const season = await this.createSeason({
            type: SeasonType.JAJAN,
            name: 'Temporada de Jajañ',
            description: 'Temporada de siembra y conexión con la tierra, enfocada en prácticas agrícolas tradicionales',
            startDate,
            endDate,
            culturalElements: {
                traditions: ['Rituales de siembra', 'Medicina tradicional', 'Cuidado de la tierra'],
                vocabulary: ['Jajañ', 'Plantas medicinales', 'Agricultura'],
                stories: ['Sabiduría de la tierra', 'Ciclos naturales']
            },
            rewards: {
                points: 1200,
                specialBadge: 'Guardián de la Tierra',
                culturalItems: ['Semillas sagradas', 'Libro de medicina tradicional']
            }
        });

        await this.generateSeasonMissions(season);
        return season;
    }

    async generateBengbeBetsaSeason(): Promise<Season> {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 60); // 2 meses

        const season = await this.createSeason({
            type: SeasonType.BENGBE_BETSA,
            name: 'Temporada de Bëngbe Bëtsá',
            description: 'Temporada dedicada a la espiritualidad Kamëntsá, enfocada en historias tradicionales y prácticas espirituales',
            startDate,
            endDate,
            culturalElements: {
                traditions: ['Ceremonias espirituales', 'Medicina tradicional', 'Rituales de sanación'],
                vocabulary: ['Bëngbe Bëtsá', 'Espíritu', 'Sanación', 'Sabiduría'],
                stories: ['Historias de los ancestros', 'Enseñanzas espirituales']
            },
            rewards: {
                points: 1500,
                specialBadge: 'Guardián Espiritual',
                culturalItems: ['Libro de oraciones', 'Elementos ceremoniales']
            }
        });

        await this.generateSeasonMissions(season);
        return season;
    }

    async generateAnteuanSeason(): Promise<Season> {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 90); // 3 meses

        const season = await this.createSeason({
            type: SeasonType.ANTEUAN,
            name: 'Temporada de Anteuán',
            description: 'Temporada dedicada a los ancestros y la memoria histórica del pueblo Kamëntsá',
            startDate,
            endDate,
            culturalElements: {
                traditions: ['Historias ancestrales', 'Artesanías tradicionales', 'Técnicas ancestrales'],
                vocabulary: ['Anteuán', 'Ancestros', 'Memoria', 'Tradición'],
                stories: ['Historias de los mayores', 'Leyendas tradicionales']
            },
            rewards: {
                points: 1800,
                specialBadge: 'Guardián de la Memoria',
                culturalItems: ['Tejido tradicional', 'Libro de historias ancestrales']
            }
        });

        await this.generateSeasonMissions(season);
        return season;
    }

    private async generateSeasonMissions(season: Season): Promise<void> {
        const template = {
            frequency: MissionFrequency.WEEKLY,
            startDate: season.startDate,
            endDate: season.endDate,
            season: season
        };

        switch (season.type) {
            case SeasonType.BETSCNATE:
                const betscnateMissions = [
                    {
                        title: 'Danzas del Bëtscnaté',
                        description: 'Aprende y practica las danzas tradicionales',
                        type: MissionType.CULTURAL_CONTENT,
                        targetValue: 5,
                        rewardPoints: 300,
                        bonusConditions: [{
                            condition: 'perfect_score',
                            multiplier: 1.5
                        }]
                    },
                    {
                        title: 'Maestro del Ritual',
                        description: 'Participa en 3 ceremonias de perdón',
                        type: MissionType.COMMUNITY_INTERACTION,
                        targetValue: 3,
                        rewardPoints: 200,
                        bonusConditions: [{
                            condition: 'perfect_score',
                            multiplier: 1.5
                        }]
                    }
                ];

                for (const missionData of betscnateMissions) {
                    await this.missionService.createMission({
                        ...template,
                        ...missionData
                    });
                }
                break;

            case SeasonType.JAJAN:
                const jajanMissions = [
                    {
                        title: 'Conocimiento de Plantas Medicinales',
                        description: 'Documenta y aprende sobre plantas medicinales',
                        type: MissionType.CULTURAL_CONTENT,
                        targetValue: 3,
                        rewardPoints: 250,
                        bonusConditions: [{
                            condition: 'streak_active',
                            multiplier: 1.3
                        }]
                    },
                    {
                        title: 'Guardián de semillas',
                        description: 'Documenta el proceso de siembra tradicional',
                        type: MissionType.COMMUNITY_INTERACTION,
                        targetValue: 1,
                        rewardPoints: 300,
                        bonusConditions: [{
                            condition: 'streak_active',
                            multiplier: 1.3
                        }]
                    }
                ];

                for (const missionData of jajanMissions) {
                    await this.missionService.createMission({
                        ...template,
                        ...missionData
                    });
                }
                break;

            case SeasonType.BENGBE_BETSA:
                const bengbeBetsaMissions = [
                    {
                        title: 'Aprendiz Espiritual',
                        description: 'Aprende y documenta 3 oraciones tradicionales',
                        type: MissionType.CULTURAL_CONTENT,
                        targetValue: 3,
                        rewardPoints: 200,
                        bonusConditions: [{
                            condition: 'perfect_score',
                            multiplier: 1.5
                        }]
                    },
                    {
                        title: 'Guardián de la Medicina',
                        description: 'Participa en una ceremonia de sanación tradicional',
                        type: MissionType.COMMUNITY_INTERACTION,
                        targetValue: 1,
                        rewardPoints: 400,
                        bonusConditions: [{
                            condition: 'perfect_score',
                            multiplier: 1.5
                        }]
                    }
                ];

                for (const missionData of bengbeBetsaMissions) {
                    await this.missionService.createMission({
                        ...template,
                        ...missionData
                    });
                }
                break;

            case SeasonType.ANTEUAN:
                const anteuanMissions = [
                    {
                        title: 'Recopilador de Historias',
                        description: 'Documenta 5 historias de los mayores',
                        type: MissionType.CULTURAL_CONTENT,
                        targetValue: 5,
                        rewardPoints: 250,
                        bonusConditions: [{
                            condition: 'streak_active',
                            multiplier: 1.5
                        }]
                    },
                    {
                        title: 'Artesano Tradicional',
                        description: 'Aprende y practica una técnica artesanal ancestral',
                        type: MissionType.COMMUNITY_INTERACTION,
                        targetValue: 1,
                        rewardPoints: 350,
                        bonusConditions: [{
                            condition: 'streak_active',
                            multiplier: 1.5
                        }]
                    }
                ];

                for (const missionData of anteuanMissions) {
                    await this.missionService.createMission({
                        ...template,
                        ...missionData
                    });
                }
                break;
        }
    }

    async getSeasonProgress(userId: string): Promise<{
        completedMissions: number;
        totalMissions: number;
        earnedPoints: number;
        rank: string;
    }> {
        const currentSeason = await this.getCurrentSeason();

        // Calcular misiones completadas
        let completedMissions = 0;
        let earnedPoints = 0;

        for (const mission of currentSeason.missions) {
            const completion = mission.completedBy.find(c => c.userId === userId);
            if (completion?.completedAt) {
                completedMissions++;
                earnedPoints += mission.rewardPoints;
            }
        }

        // Determinar rango basado en progreso
        let rank = 'Principiante';
        if (completedMissions >= currentSeason.missions.length * 0.75) {
            rank = 'Maestro';
        } else if (completedMissions >= currentSeason.missions.length * 0.5) {
            rank = 'Aprendiz Avanzado';
        } else if (completedMissions >= currentSeason.missions.length * 0.25) {
            rank = 'Aprendiz';
        }

        return {
            completedMissions,
            totalMissions: currentSeason.missions.length,
            earnedPoints,
            rank
        };
    }

    async generateSeasonDynamicMissions(season: Season, userId: string): Promise<void> {
        const seasonTemplates = {
            [SeasonType.BETSCNATE]: [
                {
                    title: 'Maestro de la Danza',
                    description: 'Aprende y enseña una danza tradicional',
                    type: MissionType.CULTURAL_CONTENT,
                    targetValue: 1,
                    rewardPoints: 150,
                    baseTargetValue: 1,
                    baseRewardPoints: 150,
                    minLevel: 3,
                    frequency: MissionFrequency.WEEKLY,
                    bonusConditions: [
                        { condition: 'perfect_score', multiplier: 1.5 },
                        { condition: 'streak_active', multiplier: 1.2 }
                    ]
                }
            ],
            [SeasonType.JAJAN]: [
                {
                    title: 'Sabio de las Plantas',
                    description: 'Identifica y documenta plantas medicinales',
                    type: MissionType.CULTURAL_CONTENT,
                    targetValue: 3,
                    rewardPoints: 200,
                    baseTargetValue: 3,
                    baseRewardPoints: 200,
                    minLevel: 2,
                    frequency: MissionFrequency.WEEKLY,
                    bonusConditions: [
                        { condition: 'streak_active', multiplier: 1.3 }
                    ]
                }
            ],
            [SeasonType.BENGBE_BETSA]: [
                {
                    title: 'Guardián de la Sabiduría',
                    description: 'Comparte enseñanzas espirituales con la comunidad',
                    type: MissionType.COMMUNITY_INTERACTION,
                    targetValue: 2,
                    rewardPoints: 250,
                    baseTargetValue: 2,
                    baseRewardPoints: 250,
                    minLevel: 4,
                    frequency: MissionFrequency.WEEKLY,
                    bonusConditions: [
                        { condition: 'perfect_score', multiplier: 1.4 }
                    ]
                }
            ],
            [SeasonType.ANTEUAN]: [
                {
                    title: 'Narrador de Historias',
                    description: 'Recopila y comparte historias ancestrales',
                    type: MissionType.CULTURAL_CONTENT,
                    targetValue: 3,
                    rewardPoints: 300,
                    baseTargetValue: 3,
                    baseRewardPoints: 300,
                    minLevel: 3,
                    frequency: MissionFrequency.WEEKLY,
                    bonusConditions: [
                        { condition: 'streak_active', multiplier: 1.5 }
                    ]
                }
            ]
        };

        const templates = seasonTemplates[season.type] || [];
        for (const template of templates) {
            await this.missionService.createMission({
                ...template,
                startDate: season.startDate,
                endDate: season.endDate,
                season: season
            });
        }
    }

    async startNewSeason(type: SeasonType, userId: string): Promise<Season> {
        let season: Season;

        switch (type) {
            case SeasonType.BETSCNATE:
                season = await this.generateBetscnateSeason();
                break;
            case SeasonType.JAJAN:
                season = await this.generateJajanSeason();
                break;
            case SeasonType.BENGBE_BETSA:
                season = await this.generateBengbeBetsaSeason();
                break;
            case SeasonType.ANTEUAN:
                season = await this.generateAnteuanSeason();
                break;
            default:
                throw new Error('Tipo de temporada no válido');
        }

        // Generar misiones estáticas
        await this.generateSeasonMissions(season);

        // Generar misiones dinámicas
        await this.generateSeasonDynamicMissions(season, userId);

        return season;
    }
} 