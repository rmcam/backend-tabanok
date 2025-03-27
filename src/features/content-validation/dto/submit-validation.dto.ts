import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ContentType } from '../interfaces/content-validation.interface';

export class SubmitValidationDto {
    @ApiProperty({
        description: 'ID del contenido a validar',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    contentId: string;

    @ApiProperty({
        description: 'Tipo de contenido',
        enum: ContentType,
        example: ContentType.WORD
    })
    @IsEnum(ContentType)
    contentType: ContentType;

    @ApiProperty({
        description: 'Contenido original en Kamëntsá',
        example: 'Taita'
    })
    @IsString()
    @IsNotEmpty()
    originalContent: string;

    @ApiProperty({
        description: 'Traducción al español',
        example: 'Padre/Señor (término de respeto)'
    })
    @IsString()
    @IsNotEmpty()
    translatedContent: string;

    @ApiProperty({
        description: 'ID del usuario que envía el contenido',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    submittedBy: string;

    @ApiProperty({
        description: 'Contexto cultural del contenido',
        example: 'Término utilizado para referirse a los mayores y autoridades tradicionales',
        required: false
    })
    @IsString()
    @IsOptional()
    culturalContext?: string;

    @ApiProperty({
        description: 'Variación dialectal específica',
        example: 'Valle de Sibundoy',
        required: false
    })
    @IsString()
    @IsOptional()
    dialectVariation?: string;

    @ApiProperty({
        description: 'Etiquetas relacionadas',
        example: ['familia', 'autoridad', 'respeto'],
        required: false,
        type: [String]
    })
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
} 