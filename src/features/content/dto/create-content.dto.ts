import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';
import { ContentType } from '../entities/content.entity';

export class CreateContentDto {
    @ApiProperty({ description: 'Título del contenido' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Descripción del contenido' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Tipo de contenido', enum: ContentType })
    @IsEnum(ContentType)
    type: ContentType;

    @ApiProperty({ description: 'Contenido textual', required: false })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiProperty({ description: 'URL del archivo', required: false })
    @IsUrl()
    @IsOptional()
    fileUrl?: string;

    @ApiProperty({ description: 'URL de la miniatura', required: false })
    @IsUrl()
    @IsOptional()
    thumbnailUrl?: string;

    @ApiProperty({ description: 'Metadatos adicionales', required: false })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiProperty({ description: 'Orden del contenido', required: false })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiProperty({ description: 'Si el contenido está activo', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ description: 'Duración en segundos', required: false })
    @IsNumber()
    @IsOptional()
    duration?: number;

    @ApiProperty({ description: 'ID de la lección a la que pertenece' })
    @IsNumber()
    lessonId: number;
} 