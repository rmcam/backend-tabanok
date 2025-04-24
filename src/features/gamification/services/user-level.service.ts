import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { NotificationPriority, NotificationType } from '../../notifications/entities/notification.entity';
import { NotificationService } from '../../notifications/services/notification.service'; // Corregido: import
import { UserLevel } from '../entities/user-level.entity';
import { UpdateUserLevelDto } from '../dto/update-user-level.dto';
import { calculateLevel } from '../../../lib/gamification';

@Injectable()
export class UserLevelService {
    constructor(
        @InjectRepository(UserLevel)
        private userLevelRepository: Repository<UserLevel>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private notificationService: NotificationService
    ) { }

    async getUserLevel(userId: string): Promise<UserLevel> {
        const userLevel = await this.userLevelRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });
        if (!userLevel) {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException('Usuario no encontrado');
            }
            const newUserLevel = this.userLevelRepository.create({
                user,
                currentLevel: 1,
                experiencePoints: 0,
                experienceToNextLevel: 100
            });
            return this.userLevelRepository.save(newUserLevel);
        }
        return userLevel;
    }

    async updateUserLevel(userId: string, updateUserLevelDto: UpdateUserLevelDto): Promise<UserLevel> {
        const userLevel = await this.getUserLevel(userId);

        if (updateUserLevelDto.experiencePoints) {
            userLevel.experiencePoints = updateUserLevelDto.experiencePoints;
        }

        if (updateUserLevelDto.currentLevel) {
            userLevel.currentLevel = updateUserLevelDto.currentLevel;
        }

        // Calcular nuevo nivel basado en puntos de experiencia
        const newLevel = calculateLevel(userLevel.experiencePoints);

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

    async addExperiencePoints(userId: string, points: number): Promise<UserLevel> {
        const userLevel = await this.getUserLevel(userId);
        const updateUserLevelDto: UpdateUserLevelDto = {
            experiencePoints: userLevel.experiencePoints + points
        };
        return this.updateUserLevel(userId, updateUserLevelDto);
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
