import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MeaningDto {
  @ApiProperty({ description: 'Definición del significado', example: 'Casa' })
  @IsString()
  @IsNotEmpty()
  definicion: string;

  @ApiProperty({ description: 'Ejemplos de uso del significado', example: ['Mi casa es grande'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ejemplos?: string[];
}

export class EquivalentDto {
  @ApiProperty({ description: 'Palabra equivalente', example: 'casa' })
  @IsString()
  @IsNotEmpty()
  palabra: string;

  @ApiProperty({ description: 'Idioma del equivalente', example: 'Español', required: false })
  @IsString()
  @IsOptional()
  idioma?: string;
}

export class DictionaryEntryDto {
  @ApiProperty({ description: 'Palabra o frase en Kamëntsá', example: 'Jajun' })
  @IsString()
  @IsNotEmpty()
  entrada: string;

  @ApiProperty({ description: 'Tipo de palabra (sustantivo, verbo, etc.)', example: 'Sustantivo', required: false })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiProperty({ description: 'Pronunciación de la palabra', example: '/ha-hun/', required: false })
  @IsString()
  @IsOptional()
  pronunciacion?: string;

  @ApiProperty({ type: [MeaningDto], description: 'Significados de la palabra' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeaningDto)
  significados: MeaningDto[];

  @ApiProperty({ type: [EquivalentDto], description: 'Palabras equivalentes en otros idiomas', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquivalentDto)
  @IsOptional()
  equivalentes?: EquivalentDto[];

  @ApiProperty({ description: 'Contexto cultural o notas adicionales', example: 'Usado en ceremonias', required: false })
  @IsString()
  @IsOptional()
  contextoCultural?: string;
}
