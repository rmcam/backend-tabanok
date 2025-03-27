import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { RewardType } from '../entities/reward.entity';

export class CreateRewardDto {
    @ApiProperty({
        description: 'El título de la recompensa',
        example: 'Maestro del Vocabulario',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'La descripción de la recompensa',
        example: 'Completaste todas las lecciones de vocabulario',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'El tipo de recompensa',
        enum: RewardType,
        example: RewardType.ACHIEVEMENT,
    })
    @IsEnum(RewardType)
    type: RewardType;

    @ApiProperty({
        description: 'Los criterios para obtener la recompensa',
        example: { lessonsCompleted: 10, minScore: 80 },
        required: false,
    })
    @IsOptional()
    criteria?: Record<string, any>;

    @ApiProperty({
        description: 'Los puntos que otorga la recompensa',
        example: 100,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    points: number;

    @ApiProperty({
        description: 'Si la recompensa es secreta',
        example: false,
    })
    @IsBoolean()
    isSecret: boolean;

    @ApiProperty({
        description: 'ID del usuario que recibe la recompensa',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    userId: string;
} 