import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ValidationStatus } from '../enums/validation-status.enum';
import { VersionStatus } from '../enums/version-status.enum';

export class UpdateVersionDto {
    @ApiProperty({ description: 'Contenido de la versión', required: false })
    @IsOptional()
    @IsObject()
    content?: Record<string, any>;

    @ApiProperty({ description: 'Metadatos de la versión', required: false })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @ApiProperty({ description: 'Estado de la versión', required: false, enum: VersionStatus })
    @IsOptional()
    @IsEnum(VersionStatus)
    status?: VersionStatus;

    @ApiProperty({ description: 'Estado de validación', required: false, enum: ValidationStatus })
    @IsOptional()
    @IsEnum(ValidationStatus)
    validationStatus?: ValidationStatus;

    @ApiProperty({ description: 'Autor de la actualización', required: true })
    @IsString()
    author: string;
} 