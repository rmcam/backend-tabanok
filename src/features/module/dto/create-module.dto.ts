import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ description: 'Nombre del módulo de aprendizaje', example: 'Módulo 1: Fundamentos' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descripción del módulo de aprendizaje', example: 'Este módulo cubre los conceptos básicos del idioma.' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
