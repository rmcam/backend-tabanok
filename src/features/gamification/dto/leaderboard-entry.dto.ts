import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({ description: 'ID del usuario' })
  userId: string;

  @ApiProperty({ description: 'Nombre de usuario' })
  username: string;

  @ApiProperty({ description: 'Puntuación del usuario' })
  score: number;

  @ApiProperty({ description: 'Rango del usuario en la tabla de clasificación' })
  rank: number;
}
