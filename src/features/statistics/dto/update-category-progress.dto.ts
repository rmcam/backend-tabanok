import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class UpdateCategoryProgressDto {
  @ApiProperty({ description: 'Nuevo puntaje en la categoría', example: 90 })
  @IsNumber()
  @IsNotEmpty()
  score: number;

  @ApiProperty({ description: 'Tiempo dedicado en la categoría en minutos', example: 60 })
  @IsNumber()
  @IsNotEmpty()
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Ejercicios completados en la categoría', example: 10 })
  @IsNumber()
  @IsNotEmpty()
  exercisesCompleted: number;
}
