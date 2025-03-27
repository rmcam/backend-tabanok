import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ description: 'Título de la lección' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Descripción de la lección' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Orden de la lección', required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ description: 'Si la lección está activa', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Si la lección está bloqueada', required: false })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiProperty({ description: 'Puntos requeridos para desbloquear', required: false })
  @IsNumber()
  @IsOptional()
  requiredPoints?: number;

  @ApiProperty({ description: 'Puntos de experiencia otorgados', required: false })
  @IsNumber()
  @IsOptional()
  experiencePoints?: number;

  @ApiProperty({ description: 'Metadatos adicionales', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'ID del nivel al que pertenece' })
  @IsNumber()
  levelId: number;

  @ApiProperty({ description: 'Duración estimada en minutos', required: false })
  @IsNumber()
  @IsOptional()
  estimatedDuration?: number;
}
