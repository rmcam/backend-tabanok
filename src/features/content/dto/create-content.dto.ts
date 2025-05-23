import { IsString, IsOptional, IsNumber, IsJSON, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContentDto {
  @ApiProperty({ description: 'Título del contenido', example: 'Introducción a Kamentsa' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Descripción del contenido', example: 'Este contenido cubre los fundamentos del idioma Kamentsa', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Tipo de contenido (e.g., "text", "video", "quiz")', example: 'text' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Contenido real, puede ser JSON o cualquier estructura de datos',
    example: { text: 'Hola mundo en Kamentsa', mediaUrl: 'http://example.com/video.mp4' },
    required: false,
  })
  @IsOptional()
  @IsJSON()
  content?: any; // Considerar un DTO más específico si la estructura es fija

  @ApiProperty({ description: 'ID de la unidad a la que pertenece el contenido', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  unityId: string;

  @ApiProperty({ description: 'ID del tema al que pertenece el contenido', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  topicId: string;

  @ApiProperty({ description: 'Orden del contenido dentro del tema', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;
}
