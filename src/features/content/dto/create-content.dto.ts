import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ContentType } from '../enums/content-type.enum';

export class CreateContentDto {
    @ApiProperty({
        description: 'Título del contenido',
        example: 'Introducción a los saludos',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Descripción del contenido',
        example: 'Aprenderemos los saludos básicos en inglés',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'Tipo de contenido (texto, video, audio, imagen)',
        enum: ContentType,
        example: ContentType.TEXT,
    })
    @IsEnum(ContentType)
    type: ContentType;

    @ApiProperty({
        description: 'URL del archivo multimedia (si aplica)',
        example: 'https://storage.example.com/video123.mp4',
        required: false,
    })
    @IsString()
    @IsOptional()
    fileUrl?: string;

    @ApiProperty({
        description: 'Contenido textual (si es de tipo texto)',
        example: 'Hello = Hola\nGood morning = Buenos días',
        required: false,
    })
    @IsString()
    @IsOptional()
    textContent?: string;

    @ApiProperty({
        description: 'Duración en segundos (para audio/video)',
        example: 300,
        required: false,
        minimum: 0,
        maximum: 7200, // 2 horas máximo
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(7200)
    duration?: number;

    @ApiProperty({
        description: 'ID de la lección a la que pertenece este contenido',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    lessonId: string;

    @ApiProperty({
        description: 'Orden del contenido dentro de la lección',
        example: 1,
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    order: number;
} 