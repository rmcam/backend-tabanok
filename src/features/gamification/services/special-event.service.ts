import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Season, SeasonType } from '../entities/season.entity';
import { EventType, SpecialEvent } from '../entities/special-event.entity';
import { GamificationService } from '../gamification.service';

@Injectable()
export class SpecialEventService {
    constructor(
        @InjectRepository(SpecialEvent)
        private specialEventRepository: Repository<SpecialEvent>,
        @InjectRepository(Season)
        private seasonRepository: Repository<Season>,
        private gamificationService: GamificationService
    ) { }

    async createSpecialEvent(seasonId: string, eventData: Partial<SpecialEvent>): Promise<SpecialEvent> {
        const season = await this.seasonRepository.findOne({
            where: { id: seasonId }
        });

        if (!season) {
            throw new NotFoundException(`Temporada con ID ${seasonId} no encontrada`);
        }

        const event = this.specialEventRepository.create({
            ...eventData,
            season
        });

        return this.specialEventRepository.save(event);
    }

    async getActiveEvents(): Promise<SpecialEvent[]> {
        const now = new Date();
        return this.specialEventRepository.find({
            where: {
                startDate: LessThanOrEqual(now),
                endDate: MoreThanOrEqual(now),
                isActive: true
            },
            relations: ['season']
        });
    }

    async joinEvent(eventId: string, userId: string): Promise<void> {
        const event = await this.specialEventRepository.findOne({
            where: { id: eventId }
        });

        if (!event) {
            throw new NotFoundException(`Evento con ID ${eventId} no encontrado`);
        }

        // Verificar requisitos
        const gamification = await this.gamificationService.findByUserId(userId);

        if (event.requirements.minLevel && gamification.level < event.requirements.minLevel) {
            throw new Error(`Necesitas nivel ${event.requirements.minLevel} para unirte a este evento`);
        }

        if (event.requirements.culturalAchievements?.length > 0) {
            const hasAchievements = event.requirements.culturalAchievements.every(
                achievementId => gamification.culturalAchievements.some(a => a.title === achievementId)
            );
            if (!hasAchievements) {
                throw new Error('No cumples con los logros culturales requeridos');
            }
        }

        // Agregar participante
        event.participants.push({
            userId,
            joinedAt: new Date(),
            progress: 0
        });

        await this.specialEventRepository.save(event);
    }

    async updateEventProgress(eventId: string, userId: string, progress: number): Promise<void> {
        const event = await this.specialEventRepository.findOne({
            where: { id: eventId }
        });

        if (!event) {
            throw new NotFoundException(`Evento con ID ${eventId} no encontrado`);
        }

        const participant = event.participants.find(p => p.userId === userId);
        if (!participant) {
            throw new Error('No estás participando en este evento');
        }

        participant.progress = progress;
        if (progress >= 100 && !participant.completedAt) {
            participant.completedAt = new Date();
            await this.awardEventRewards(userId, event);
        }

        await this.specialEventRepository.save(event);
    }

    private async awardEventRewards(userId: string, event: SpecialEvent): Promise<void> {
        // Otorgar puntos y valor cultural
        await this.gamificationService.addPoints(
            userId,
            event.rewards.points,
            'special_event_completed',
            `¡Evento completado: ${event.name}!`
        );

        // Actualizar logros culturales si es necesario
        const gamification = await this.gamificationService.findByUserId(userId);
        gamification.culturalAchievements.push({
            title: event.name,
            description: event.description,
            culturalValue: `Participación en ${event.type}`,
            achievedAt: new Date(),
            seasonType: event.season.type
        });

        // Otorgar insignia especial si existe
        if (event.rewards.specialBadge) {
            gamification.badges.push({
                ...event.rewards.specialBadge,
                description: `Insignia especial por completar: ${event.name}`,
                category: 'special_event',
                tier: 'diamond',
                requiredPoints: event.rewards.points,
                iconUrl: event.rewards.specialBadge.icon,
                requirements: {},
                isSpecial: true,
                timesAwarded: 1,
                benefits: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                expirationDate: null
            });
        }

        await this.gamificationService.updateStats(userId, {
            culturalContributions: gamification.stats.culturalContributions + 1
        });
    }

    async generateSeasonEvents(season: Season): Promise<void> {
        const eventTemplates = {
            [SeasonType.BETSCNATE]: [
                {
                    name: 'Gran Celebración del Bëtscnaté',
                    description: 'Participa en la celebración principal del Carnaval del Perdón',
                    type: EventType.FESTIVAL,
                    rewards: {
                        points: 500,
                        culturalValue: 300,
                        specialBadge: {
                            id: 'betscnate-master',
                            name: 'Maestro del Bëtscnaté',
                            icon: '🎭'
                        }
                    },
                    requirements: {
                        minLevel: 5
                    },
                    culturalElements: {
                        traditions: ['Danza del Carnaval', 'Ritual del Perdón'],
                        vocabulary: ['Bëtscnaté', 'Perdón', 'Celebración'],
                        activities: ['Danza grupal', 'Ceremonia de perdón']
                    }
                }
            ],
            [SeasonType.JAJAN]: [
                {
                    name: 'Festival de la Siembra',
                    description: 'Participa en el ritual tradicional de siembra',
                    type: EventType.CEREMONIA,
                    rewards: {
                        points: 400,
                        culturalValue: 250,
                        specialBadge: {
                            id: 'jajan-guardian',
                            name: 'Guardián de la Siembra',
                            icon: '🌱'
                        }
                    },
                    requirements: {
                        minLevel: 3
                    },
                    culturalElements: {
                        traditions: ['Ritual de siembra', 'Bendición de semillas'],
                        vocabulary: ['Jajañ', 'Siembra', 'Tierra'],
                        activities: ['Siembra ceremonial', 'Preparación de la tierra']
                    }
                }
            ]
        };

        const templates = eventTemplates[season.type] || [];
        for (const template of templates) {
            await this.createSpecialEvent(season.id, {
                ...template,
                startDate: season.startDate,
                endDate: new Date(season.startDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 días
                isActive: true
            });
        }
    }
} 