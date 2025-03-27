import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateRewardDto {
    @ApiProperty({ description: 'Nombre de la recompensa' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Descripción de la recompensa' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Tipo de recompensa (badge, achievement, points, etc.)' })
    @IsString()
    type: string;

    @ApiProperty({ description: 'Puntos asociados a la recompensa' })
    @IsNumber()
    points: number;

    @ApiProperty({ description: 'Criterios para obtener la recompensa', required: false })
    @IsOptional()
    @IsObject()
    criteria?: Record<string, any>;

    @ApiProperty({ description: 'Metadatos adicionales (imagen, sonido, etc.)', required: false })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @ApiProperty({ description: 'ID de la actividad asociada', required: false })
    @IsOptional()
    @IsString()
    activityId?: string;
}
