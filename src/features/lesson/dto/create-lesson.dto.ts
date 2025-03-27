import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Título de la lección',
    example: 'Introducción a los verbos',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descripción de la lección',
    example: 'Aprenderemos los verbos más comunes y su conjugación',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Orden de la lección dentro del nivel',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({
    description: 'Puntos requeridos para desbloquear la lección',
    example: 100,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  requiredPoints?: number;

  @ApiProperty({
    description: 'Metadatos adicionales',
    example: {
      difficulty: 'beginner',
      estimatedTime: '30min',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'ID del nivel al que pertenece esta lección',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  levelId: string;
}
