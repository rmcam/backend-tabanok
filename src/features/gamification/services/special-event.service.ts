import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Season, SeasonType } from '../entities/season.entity';
import { EventType, SpecialEvent } from '../entities/special-event.entity';
import { GamificationService } from './gamification.service';
import { UserAchievement } from '../entities/user-achievement.entity';
import { Achievement } from '../entities/achievement.entity';
import { Inject } from '@nestjs/common';
import { UserAchievementRepository } from '../repositories/user-achievement.repository'; // Importar UserAchievementRepository

@Injectable()
export class SpecialEventService {
  constructor(
    @InjectRepository(SpecialEvent)
    private specialEventRepository: Repository<SpecialEvent>,
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
    private gamificationService: GamificationService,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    private userAchievementRepository: UserAchievementRepository, // Inyectar UserAchievementRepository
  ) {}

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
        if (event.requirements.culturalAchievements?.length > 0) {
            const userAchievements = await this.userAchievementRepository.find({
                where: { userId: userId, status: 'COMPLETED' as any }, // Buscar logros completados del usuario
            });

            const completedAchievementIds = userAchievements.map(ua => ua.achievementId);

            const hasAchievements = event.requirements.culturalAchievements.every(
                achievementId => completedAchievementIds.includes(achievementId)
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
    // Otorgar puntos y valor cultural usando GamificationService
    await this.gamificationService.awardPoints(
      userId,
      event.rewards.points,
      'special_event_completed', // Tipo de actividad
      `Evento especial completado: ${event.name}` // Descripción
    );

    // TODO: Implementar lógica para otorgar insignia o logro si aplica, ahora que specialBadge fue eliminado de la entidad SpecialEvent.
    // La lógica podría implicar buscar una insignia/logro por un ID predefinido o a través de otra configuración.

    // await this.specialEventRepository.save(event); // No es necesario guardar aquí, GamificationService lo hace
  }

  async updateSpecialEvent(eventId: string, updateData: Partial<SpecialEvent>): Promise<SpecialEvent> {
    const event = await this.specialEventRepository.findOne({
      where: { id: eventId }
    });

    if (!event) {
      throw new NotFoundException(`Evento con ID ${eventId} no encontrado`);
    }

    // Merge updateData into the existing event object
    Object.assign(event, updateData);

    return this.specialEventRepository.save(event);
  }

  async deleteSpecialEvent(eventId: string): Promise<void> {
    const event = await this.specialEventRepository.findOne({
      where: { id: eventId }
    });

    if (!event) {
      throw new NotFoundException(`Evento con ID ${eventId} no encontrado`);
    }

    await this.specialEventRepository.remove(event);
  }

  async generateSeasonEvents(season: Season): Promise<void> {
    // TODO: Refactorizar la lógica de generación de eventos estacionales hardcodeados para obtenerla de la base de datos o un archivo de configuración.
    const eventTemplates = {
      [SeasonType.BETSCNATE]: [
        {
          name: 'Gran Celebración del Bëtscnaté',
          description: 'Participa en la celebración principal del Carnaval del Perdón y gana recompensas exclusivas.',
          type: EventType.FESTIVAL,
          rewards: {
            points: 700,
            culturalValue: 500,
            // specialBadge: { // Eliminado ya que el campo fue removido de SpecialEvent
            //   id: 'betscnate-grand-master',
            //   name: 'Gran Maestro del Bëtscnaté',
            //   icon: '🎭'
            // }
          },
          requirements: {
            minLevel: 7
          },
          culturalElements: {
            traditions: ['Danza del Carnaval', 'Ritual del Perdón', 'Elaboración de máscaras'],
            vocabulary: ['Bëtscnaté', 'Perdón', 'Celebración', 'Máscara', 'Renovación'],
            activities: ['Danza grupal', 'Ceremonia de perdón', 'Taller de máscaras']
          }
        },
        {
          name: 'Concurso de disfraces del Bëtscnaté',
          description: 'Crea el disfraz más original y gana puntos extra.',
          type: EventType.COMPETITION,
          rewards: {
            points: 600,
            culturalValue: 400,
            // specialBadge: { // Eliminado ya que el campo fue removido de SpecialEvent
            //   id: 'betscnate-costume-master',
            //   name: 'Maestro del Disfraz',
            //   icon: '🎉'
            // }
          },
          requirements: {
            minLevel: 5
          },
          culturalElements: {
            traditions: ['Concurso de disfraces', 'Desfile de máscaras'],
            vocabulary: ['Disfraz', 'Máscara', 'Creatividad', 'Originalidad'],
            activities: ['Diseño de disfraces', 'Elaboración de máscaras', 'Desfile']
          }
        }
      ],
      [SeasonType.JAJAN]: [
        {
          name: 'Festival de la Siembra',
          description: 'Participa en el ritual tradicional de siembra y recibe la bendición de la Madre Tierra.',
          type: EventType.CEREMONIA,
          rewards: {
            points: 600,
            culturalValue: 400,
            // specialBadge: { // Eliminado ya que el campo fue removido de SpecialEvent
            //   id: 'jajan-guardian',
            //   name: 'Guardián de la Siembra',
            //   icon: '🌱'
            // }
          },
          requirements: {
            minLevel: 5
          },
          culturalElements: {
            traditions: ['Ritual de siembra', 'Bendición de semillas', 'Ofrenda a la Pachamama'],
            vocabulary: ['Jajañ', 'Siembra', 'Tierra', 'Pachamama', 'Fertilidad'],
            activities: ['Siembra ceremonial', 'Preparación de la tierra', 'Ofrenda a la tierra']
          }
        },
        {
          name: 'Concurso de Canto a la Tierra',
          description: 'Participa en el concurso de canto a la tierra y celebra la fertilidad de la Pachamama.',
          type: EventType.COMPETITION,
          rewards: {
            points: 500,
            culturalValue: 300,
            // specialBadge: { // Eliminado ya que el campo fue removido de SpecialEvent
            //   id: 'jajan-singer',
            //   name: 'Cantor de la Tierra',
            //   icon: '🎤'
            // }
          },
          requirements: {
            minLevel: 3
          },
          culturalElements: {
            traditions: ['Canto a la tierra', 'Música andina'],
            vocabulary: ['Canto', 'Música', 'Tierra', 'Pachamama', 'Fertilidad'],
            activities: ['Interpretación musical', 'Composición de canciones', 'Celebración musical']
          }
        }
      ]
    };

    // TODO: Refactorizar la lógica de generación de eventos estacionales hardcodeados para obtenerla de la base de datos o un archivo de configuración.
    const templates = eventTemplates[season.type] || [];
    for (const template of templates) {
      const specialEvent = new SpecialEvent();
      specialEvent.name = template.name;
      specialEvent.description = template.description;
      specialEvent.type = template.type;
      specialEvent.rewards = template.rewards;
      specialEvent.requirements = template.requirements;
      specialEvent.culturalElements = template.culturalElements;
      specialEvent.startDate = season.startDate;
      specialEvent.endDate = new Date(season.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      specialEvent.isActive = true;
      await this.createSpecialEvent(season.id, specialEvent);
    }
  }
}
