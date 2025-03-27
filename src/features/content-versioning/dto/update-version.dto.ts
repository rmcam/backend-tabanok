import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ContentDto, CreateVersionDto } from './create-version.dto';

export class UpdateVersionDto extends PartialType(CreateVersionDto) {
    @ApiProperty({ description: 'Actualizaciones a aplicar a la versión' })
    @ValidateNested()
    @Type(() => ContentDto)
    @IsOptional()
    content?: ContentDto;

    @ApiProperty({ description: 'Autor de la actualización' })
    @IsString()
    @IsNotEmpty()
    author: string;

    @ApiProperty({ description: 'Comentario sobre la actualización', required: false })
    @IsString()
    @IsOptional()
    comment?: string;
} 