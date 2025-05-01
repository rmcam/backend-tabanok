import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateContentDto } from './create-content.dto';
import { IsBoolean, IsNumber, IsOptional, IsArray } from 'class-validator';

export class UpdateContentDto extends PartialType(CreateContentDto) {
    @ApiProperty({ description: 'Estado de la actividad', required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ description: 'Nivel del contenido', required: false })
    @IsOptional()
    @IsNumber()
    level?: number;

    @ApiProperty({ description: 'Categorías del contenido', isArray: true, required: false })
    @IsArray()
    @IsOptional()
    categories?: string[];

    @ApiProperty({ description: 'Etiquetas del contenido', isArray: true, required: false })
    @IsArray()
    @IsOptional()
    tags?: string[];
}
