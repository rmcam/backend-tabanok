import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProgressDto {
    @ApiProperty({
        description: 'ID del usuario',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'ID del ejercicio',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    exerciseId: string;

    @ApiProperty({
        description: 'La puntuación obtenida',
        example: 10,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    score: number;

    @ApiProperty({
        description: 'Si el ejercicio está completado',
        example: false,
    })
    @IsBoolean()
    isCompleted: boolean;

    @ApiProperty({
        description: 'Las respuestas del usuario',
        example: { answers: ['a', 'b', 'c'] },
        required: false,
    })
    @IsOptional()
    answers?: Record<string, any>;
} 