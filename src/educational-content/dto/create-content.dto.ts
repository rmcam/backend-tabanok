import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateContentDto {
    @ApiProperty({ description: 'Título del contenido educativo' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Descripción del contenido' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Contenido educativo en formato texto' })
    @IsString()
    content: string;

    @ApiProperty({ description: 'Tipo de contenido (vocabulario, gramática, cultura, etc.)' })
    @IsString()
    type: string;

    @ApiProperty({ description: 'Nivel de dificultad del contenido' })
    @IsNumber()
    level: number;

    @ApiProperty({ description: 'Metadatos adicionales del contenido', required: false })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
} 