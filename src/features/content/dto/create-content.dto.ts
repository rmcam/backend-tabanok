import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateContentDto {
    @ApiProperty({ description: 'Título del contenido' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Descripción del contenido', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Tipo de contenido' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'Datos del contenido (JSON)' })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;

    @ApiProperty({ description: 'Orden del contenido', default: 1 })
    @IsNumber()
    order: number;

    @ApiProperty({ description: 'Estado de la actividad', default: true })
    @IsBoolean()
    isActive: boolean;

    @ApiProperty({ description: 'Nivel del contenido', default: 1 })
    @IsNumber()
    level: number;

    @ApiProperty({ description: 'ID de la lección' })
    @IsUUID()
    @IsNotEmpty()
    lessonId: string;

    @ApiProperty({ description: 'Categorías del contenido', isArray: true, required: false })
    @IsArray()
    @IsOptional()
    categories?: string[];

    @ApiProperty({ description: 'Etiquetas del contenido', isArray: true, required: false })
    @IsArray()
    @IsOptional()
    tags?: string[];
}
