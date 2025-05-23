import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLessonDto {
    @ApiProperty({
        description: 'El título de la lección',
        example: 'Introducción al Kamentsa',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'La descripción de la lección',
        example: 'Aprende los conceptos básicos del idioma Kamentsa',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'El orden de la lección en el curso',
        example: 1,
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty({
        description: 'El contenido teórico de la lección',
        example: {
            introduction: 'El Kamentsa es una lengua...',
            sections: [
                {
                    title: 'Alfabeto',
                    content: 'El alfabeto Kamentsa consta de...',
                },
            ],
        },
    })
    @IsNotEmpty()
    content: Record<string, any>; // Considerar un DTO más específico si la estructura es fija

    @ApiProperty({
        description: 'Los objetivos de aprendizaje',
        example: ['Conocer el alfabeto', 'Aprender saludos básicos'],
        required: false,
    })
    @IsOptional()
    objectives?: string[];

    @ApiProperty({
        description: 'Los puntos que otorga completar la lección',
        example: 100,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    points: number;

    @ApiProperty({
        description: 'ID del módulo al que pertenece la lección',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    moduleId: string;
}
