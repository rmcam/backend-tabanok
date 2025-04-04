import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { NotificationPriority, NotificationType } from '../../notifications/entities/notification.entity';
import { NotificationService } from '../../notifications/services/notification.service'; // Corregido: import
import { Reward, RewardTrigger, RewardType } from '../../reward/entities/reward.entity';
import { UserLevel } from '../entities/user-level.entity';

@Injectable()
export class UserLevelService {
    constructor(
        @InjectRepository(UserLevel)
        private userLevelRepository: Repository<UserLevel>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private notificationService: NotificationService
    ) { }

    async addExperiencePoints(userId: string, points: number): Promise<UserLevel> {
        const userLevel = await this.userLevelRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });

        if (!userLevel) {
            throw new NotFoundException('Nivel de usuario no encontrado');
        }

        const previousLevel = userLevel.currentLevel;
        userLevel.experiencePoints += points;

        // Calcular nuevo nivel basado en puntos de experiencia
        const newLevel = Math.floor(Math.sqrt(userLevel.experiencePoints / 100));

        if (newLevel > userLevel.currentLevel) {
            userLevel.currentLevel = newLevel;

            // Notificar al usuario sobre el nuevo nivel
            await this.notificationService.notifyLevelUp(
                userId,
                newLevel
            );

            // Otorgar recompensas por subir de nivel si es necesario
            await this.handleLevelUpRewards(userId, newLevel);
        }

        return this.userLevelRepository.save(userLevel);
    }

    private calculateExperienceForNextLevel(currentLevel: number): number {
        return Math.pow(currentLevel + 1, 2) * 100;
    }

    private async handleLevelUpRewards(userId: string, newLevel: number): Promise<void> {
        // Aquí puedes implementar la lógica para otorgar recompensas por nivel
        // Por ejemplo, desbloquear nuevas características, dar puntos culturales extra, etc.

        // Notificar sobre recompensas desbloqueadas
        await this.notificationService.createNotification({
            userId,
            type: NotificationType.LEVEL_UP,
            title: '¡Recompensas por Nuevo Nivel!',
            message: `Has desbloqueado nuevas recompensas por alcanzar el nivel ${newLevel}`,
            priority: NotificationPriority.HIGH,
            metadata: {
                level: newLevel,
                rewards: ['Lista de recompensas específicas del nivel']
            }
        });
    }
}
