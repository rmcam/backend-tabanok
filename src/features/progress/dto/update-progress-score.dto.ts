import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateProgressScoreDto {
  @ApiProperty({ description: 'Nuevo puntaje para el progreso (0-100)', example: 90 })
  @IsNotEmpty({ message: 'El puntaje no puede estar vacío' })
  @IsInt({ message: 'El puntaje debe ser un número entero' })
  @Min(0, { message: 'El puntaje mínimo es 0' })
  @Max(100, { message: 'El puntaje máximo es 100' })
  score: number;
}
