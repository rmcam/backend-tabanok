import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateModuleDto {
    @ApiProperty({
        description: 'El título del módulo',
        example: 'Fundamentos del Kamentsa',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'La descripción del módulo',
        example: 'Aprende los conceptos fundamentales del idioma Kamentsa',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'El orden del módulo en el curso',
        example: 1,
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty({
        description: 'Los objetivos de aprendizaje del módulo',
        example: ['Dominar el alfabeto', 'Aprender vocabulario básico'],
        required: false,
    })
    @IsOptional()
    objectives?: string[];

    @ApiProperty({
        description: 'Los puntos requeridos para desbloquear el módulo',
        example: 100,
        minimum: 0,
        required: false,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    requiredPoints?: number;

    @ApiProperty({
        description: 'Metadatos adicionales del módulo',
        example: { difficulty: 'beginner', estimatedTime: '2h' },
        required: false,
    })
    @IsOptional()
    metadata?: Record<string, any>;
} 