import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ContainsKamentsaWords, HasKamentsaStructure, IsKamentsaText, IsValidKamentsaCategory } from '../../../common/validators/kamensta-language.validator';

export class CreateCulturalContentDto {
    @IsNotEmpty({ message: 'El título es requerido' })
    @IsString({ message: 'El título debe ser una cadena de texto' })
    @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El título no debe exceder los 100 caracteres' })
    @IsKamentsaText({ message: 'El título debe contener texto en Kamëntsá' })
    @ApiProperty({ description: 'Título del contenido cultural' })
    title: string;

    @IsNotEmpty({ message: 'La descripción es requerida' })
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
    @MaxLength(1000, { message: 'La descripción no debe exceder los 1000 caracteres' })
    @ContainsKamentsaWords({ message: 'La descripción debe contener palabras en Kamëntsá' })
    @HasKamentsaStructure({ message: 'La descripción debe seguir la estructura gramatical Kamëntsá' })
    @ApiProperty({ description: 'Descripción detallada del contenido cultural' })
    description: string;

    @IsNotEmpty({ message: 'La categoría es requerida' })
    @IsString({ message: 'La categoría debe ser una cadena de texto' })
    @IsValidKamentsaCategory({ message: 'La categoría debe ser una categoría cultural válida en Kamëntsá' })
    @ApiProperty({ description: 'Contexto cultural específico' })
    category: string;

    @IsNotEmpty({ message: 'El contenido es requerido' })
    @IsString({ message: 'El contenido debe ser una cadena de texto' })
    @MinLength(50, { message: 'El contenido debe tener al menos 50 caracteres' })
    @MaxLength(5000, { message: 'El contenido no debe exceder los 5000 caracteres' })
    @ContainsKamentsaWords({ message: 'El contenido debe contener palabras en Kamëntsá' })
    @HasKamentsaStructure({ message: 'El contenido debe seguir la estructura gramatical Kamëntsá' })
    @ApiProperty({ description: 'Texto del contenido cultural' })
    content: string;

    @ApiProperty({ description: 'URL del contenido multimedia asociado', required: false })
    @IsOptional()
    @IsUrl()
    mediaUrl?: string;

    @ApiProperty({ description: 'Tipo de contenido cultural (historia, tradición, ritual, etc.)' })
    @IsString()
    type: string;

    @ApiProperty({ description: 'Etiquetas para categorizar el contenido', required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
} 