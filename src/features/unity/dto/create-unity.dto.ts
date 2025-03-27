import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateUnityDto {
    @ApiProperty({
        description: 'Nombre de la unidad de aprendizaje',
        example: 'Unidad 1: Saludos y presentaciones',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Descripción detallada de la unidad de aprendizaje',
        example: 'Aprende los saludos básicos y cómo presentarte en Kamentsa',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'Número de orden de la unidad en el curso',
        example: 1,
        minimum: 1,
        type: Number,
    })
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty({
        description: 'Puntos necesarios para desbloquear la unidad',
        example: 100,
        minimum: 0,
        required: false,
        type: Number,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    requiredPoints?: number;

    @ApiProperty({
        description: 'Metadatos adicionales de la unidad (opcional)',
        example: {
            dificultad: 'principiante',
            tiempoEstimado: '2 horas',
            objetivos: ['Aprender saludos básicos', 'Practicar presentaciones']
        },
        required: false,
        type: 'object',
    })
    @IsOptional()
    metadata?: Record<string, any>;
} 