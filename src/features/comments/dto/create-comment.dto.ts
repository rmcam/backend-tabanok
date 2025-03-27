import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty({ description: 'Contenido del comentario' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ description: 'Autor del comentario' })
    @IsString()
    @IsNotEmpty()
    author: string;

    @ApiProperty({ description: 'ID de la versión a la que pertenece el comentario' })
    @IsString()
    @IsNotEmpty()
    versionId: string;

    @ApiProperty({ description: 'ID del comentario padre (para respuestas)', required: false })
    @IsString()
    @IsOptional()
    parentId?: string;

    @ApiProperty({ description: 'Menciones a usuarios', type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    mentions?: string[];

    @ApiProperty({ description: 'URLs de archivos adjuntos', type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    attachments?: string[];

    @ApiProperty({ description: 'Metadatos adicionales', required: false })
    @IsOptional()
    metadata?: Record<string, any>;
} 