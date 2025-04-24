import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateUserLevelDto {
    @ApiProperty({ description: 'Puntos de experiencia a añadir', required: false })
    @IsOptional()
    @IsNumber()
    experiencePoints?: number;

    @ApiProperty({ description: 'Nivel actual del usuario', required: false })
    @IsOptional()
    @IsNumber()
    currentLevel?: number;
}
