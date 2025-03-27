import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VersionMetadataDto {
    @ApiProperty({ description: 'Etiquetas de la versión', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags: string[];

    @ApiProperty({ description: 'Autor de la versión' })
    @IsString()
    @IsNotEmpty()
    author: string;

    @ApiProperty({ description: 'Rol del autor', required: false })
    @IsString()
    @IsOptional()
    authorRole?: string;

    @ApiProperty({ description: 'Revisores de la versión', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    reviewers: string[];

    @ApiProperty({ description: 'Validador de la versión' })
    @IsString()
    @IsNotEmpty()
    validatedBy: string;

    @ApiProperty({ description: 'Fecha de creación', required: false })
    @IsDateString()
    @IsOptional()
    createdAt?: Date;

    @ApiProperty({ description: 'Fecha de modificación', required: false })
    @IsDateString()
    @IsOptional()
    modifiedAt?: Date;

    @ApiProperty({ description: 'Fecha de publicación', required: false })
    @IsDateString()
    @IsOptional()
    publishedAt?: Date;

    @ApiProperty({ description: 'Fecha de inicio de revisión', required: false })
    @IsDateString()
    @IsOptional()
    reviewStartedAt?: Date;

    @ApiProperty({ description: 'Comentarios de la versión', type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    comments?: string[];
} 