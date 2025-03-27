import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ChangeType } from '../interfaces/content-version.interface';
import { VersionMetadataDto } from './version-metadata.dto';

export class ContentDto {
    @ApiProperty({ description: 'Contenido original en Kamëntsá' })
    @IsString()
    @IsNotEmpty()
    original: string;

    @ApiProperty({ description: 'Traducción al español', required: false })
    @IsString()
    @IsOptional()
    translated?: string;

    @ApiProperty({ description: 'Contexto cultural', required: false })
    @IsString()
    @IsOptional()
    culturalContext?: string;

    @ApiProperty({ description: 'Guía de pronunciación', required: false })
    @IsString()
    @IsOptional()
    pronunciation?: string;

    @ApiProperty({ description: 'Referencia al archivo de audio', required: false })
    @IsString()
    @IsOptional()
    audioReference?: string;

    @ApiProperty({ description: 'Variación dialectal', required: false })
    @IsString()
    @IsOptional()
    dialectVariation?: string;
}

export class CreateVersionDto {
    @ApiProperty({ description: 'ID del contenido al que pertenece la versión' })
    @IsString()
    @IsNotEmpty()
    contentId: string;

    @ApiProperty({ type: ContentDto })
    @ValidateNested()
    @Type(() => ContentDto)
    content: ContentDto;

    @ApiProperty({ description: 'Autor de la versión' })
    @IsString()
    @IsNotEmpty()
    author: string;

    @ApiProperty({ enum: ChangeType, description: 'Tipo de cambio', required: false })
    @IsEnum(ChangeType)
    @IsOptional()
    changeType?: ChangeType;

    @ApiProperty({ description: 'Número de versión' })
    @IsNotEmpty()
    versionNumber: number;

    @ApiProperty({ description: 'Versión mayor' })
    @IsNotEmpty()
    majorVersion: number;

    @ApiProperty({ description: 'Versión menor' })
    @IsNotEmpty()
    minorVersion: number;

    @ApiProperty({ description: 'Parche de versión' })
    @IsNotEmpty()
    patchVersion: number;

    @ApiProperty({ description: 'Metadatos de la versión', type: VersionMetadataDto })
    @ValidateNested()
    @Type(() => VersionMetadataDto)
    metadata: VersionMetadataDto;
} 