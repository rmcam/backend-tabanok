import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateVocabularyDto {
  @ApiProperty({ example: 'Bëngbe', description: 'Palabra en Kamëntsá' })
  @IsString()
  wordKamentsa: string;

  @ApiProperty({ example: 'Hola', description: 'Palabra en español' })
  @IsString()
  wordSpanish: string;

  @ApiProperty({ example: 'Beng-be', description: 'Guía de pronunciación', required: false })
  @IsOptional()
  @IsString()
  pronunciation?: string;

  @ApiProperty({ 
    example: 'Esta palabra se usa como saludo tradicional en la comunidad Kamëntsá', 
    description: 'Contexto cultural de la palabra',
    required: false 
  })
  @IsOptional()
  @IsString()
  culturalContext?: string;

  @ApiProperty({ 
    example: 'https://storage.com/audio/bengbe.mp3', 
    description: 'URL del audio de pronunciación',
    required: false 
  })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiProperty({ 
    example: 'https://storage.com/images/bengbe.jpg', 
    description: 'URL de imagen ilustrativa',
    required: false 
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ 
    example: ['Bëngbe botamán', 'Bëngbe tsabe'], 
    description: 'Ejemplos de uso en oraciones',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];

  @ApiProperty({ 
    example: 'saludo', 
    description: 'Categoría gramatical o temática',
    required: false 
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    example: 1, 
    description: 'Nivel de dificultad (1-5)',
    minimum: 1,
    maximum: 5 
  })
  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel: number;

  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    description: 'ID del tema al que pertenece la palabra' 
  })
  @IsUUID()
  topicId: string;
} 