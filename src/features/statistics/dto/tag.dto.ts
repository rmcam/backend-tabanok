import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TagColor, TagType } from '../interfaces/tag.interface';

export class CreateTagDto {
    @ApiProperty({ description: 'Nombre de la etiqueta' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @ApiProperty({ enum: TagType, description: 'Tipo de etiqueta' })
    @IsEnum(TagType)
    type: TagType;

    @ApiProperty({ enum: TagColor, description: 'Color de la etiqueta' })
    @IsEnum(TagColor)
    color: TagColor;

    @ApiPropertyOptional({ description: 'Descripción de la etiqueta' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'ID de la etiqueta padre' })
    @IsUUID()
    @IsOptional()
    parentId?: string;

    @ApiPropertyOptional({ description: 'Metadatos adicionales' })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}

export class UpdateTagDto extends CreateTagDto {
    @ApiPropertyOptional({ description: 'Contador de uso' })
    @IsOptional()
    usageCount?: number;
}

export class TagResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ enum: TagType })
    type: TagType;

    @ApiProperty({ enum: TagColor })
    color: TagColor;

    @ApiPropertyOptional()
    description?: string;

    @ApiPropertyOptional()
    parentId?: string;

    @ApiPropertyOptional()
    metadata?: Record<string, any>;

    @ApiProperty()
    usageCount: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
} 