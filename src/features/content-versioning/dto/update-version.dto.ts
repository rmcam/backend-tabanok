import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidationStatus } from '../enums/validation-status.enum';
import { VersionStatus } from '../enums/version-status.enum';
import { ContentDto, CreateVersionDto } from './create-version.dto'; // Importar ContentDto
import { VersionMetadataDto } from './version-metadata.dto'; // Importar VersionMetadataDto

export class UpdateVersionDto extends PartialType(CreateVersionDto) {
    @ApiProperty({ description: 'Contenido de la versión', required: false, type: ContentDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => ContentDto)
    content?: ContentDto;

    @ApiProperty({ description: 'Metadatos de la versión', required: false, type: VersionMetadataDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => VersionMetadataDto)
    metadata?: VersionMetadataDto;

    @ApiProperty({ description: 'Estado de la versión', required: false, enum: VersionStatus })
    @IsOptional()
    @IsEnum(VersionStatus)
    status?: VersionStatus;

    @ApiProperty({ description: 'Estado de validación', required: false, enum: ValidationStatus })
    @IsOptional()
    @IsEnum(ValidationStatus)
    validationStatus?: ValidationStatus;

    @ApiProperty({ description: 'Autor de la actualización', required: false }) // Cambiado a opcional si se hereda de PartialType
    @IsOptional()
    @IsString()
    author?: string;
}
