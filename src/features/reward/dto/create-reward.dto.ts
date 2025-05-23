import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RewardCriteria, RewardType } from '../entities/reward.entity';
import { RewardTrigger } from '../../../common/enums/reward.enum';

export class CreateRewardDto {
    @ApiProperty({
        description: 'Nombre interno de la recompensa',
        example: 'daily_login_bonus',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

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
        example: RewardType.BADGE,
    })
    @IsEnum(RewardType)
    type: RewardType;

    @ApiProperty({
        description: 'Disparador de la recompensa',
        enum: RewardTrigger,
        example: RewardTrigger.LEVEL_UP,
    })
    @IsEnum(RewardTrigger)
    trigger: RewardTrigger;

    @ApiProperty({
        description: 'Los criterios para obtener la recompensa',
        type: [RewardCriteria],
        example: [{ type: 'lessonsCompleted', value: 10, description: 'Completar 10 lecciones' }],
        required: false,
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => RewardCriteria)
    criteria?: RewardCriteria[];

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
