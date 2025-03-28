import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
    @ApiProperty({
        description: 'Contenido actualizado del comentario',
        required: false
    })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty({
        description: 'Autor del comentario',
        required: false
    })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiProperty({
        description: 'ID de la versión a la que pertenece el comentario',
        required: false
    })
    @IsOptional()
    @IsString()
    versionId?: string;

    @ApiProperty({
        description: 'ID del comentario padre (para respuestas)',
        required: false
    })
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiProperty({
        description: 'Menciones a usuarios',
        type: [String],
        required: false
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    mentions?: string[];

    @ApiProperty({
        description: 'URLs de archivos adjuntos',
        type: [String],
        required: false
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];

    @ApiProperty({
        description: 'Metadatos adicionales',
        required: false
    })
    @IsOptional()
    metadata?: Record<string, any>;
} 