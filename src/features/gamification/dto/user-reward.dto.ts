import { ApiProperty } from '@nestjs/swagger';
import { RewardStatus } from '../entities/user-reward.entity';

export class UserRewardDto {
    @ApiProperty({ description: 'ID del usuario que recibió la recompensa' })
    userId: string;

    @ApiProperty({ description: 'ID de la recompensa otorgada' })
    rewardId: string;

    @ApiProperty({ enum: RewardStatus, description: 'Estado actual de la recompensa' })
    status: RewardStatus;

    @ApiProperty({ required: false, description: 'Metadatos adicionales de la recompensa' })
    metadata?: Record<string, any>;

    @ApiProperty({ required: false, description: 'Fecha en que se consumió la recompensa' })
    consumedAt?: Date;

    @ApiProperty({ required: false, description: 'Fecha de expiración de la recompensa' })
    expiresAt?: Date;

    @ApiProperty({ description: 'Fecha en que se otorgó la recompensa' })
    dateAwarded: Date;

    @ApiProperty({ description: 'Fecha de creación del registro' })
    createdAt: Date;
} 