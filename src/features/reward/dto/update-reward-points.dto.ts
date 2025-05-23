import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateRewardPointsDto {
  @ApiProperty({ description: 'Número de puntos a asignar a la recompensa', example: 50, minimum: 0 })
  @IsNotEmpty({ message: 'Los puntos no pueden estar vacíos' })
  @IsInt({ message: 'Los puntos deben ser un número entero' })
  @Min(0, { message: 'Los puntos no pueden ser negativos' })
  points: number;
}
