import { ApiProperty } from '@nestjs/swagger';

export class UserProgressDto {
  @ApiProperty({ description: 'ID del usuario', example: 'uuid-del-usuario' })
  userId: string;

  @ApiProperty({ description: 'Puntuación total del usuario', example: 1500 })
  totalScore: number;

  @ApiProperty({ description: 'Número de evaluaciones completadas', example: 10 })
  evaluationsCompleted: number;

  @ApiProperty({ description: 'Porcentaje de progreso general', example: 75.5 })
  overallProgressPercentage: number;

  @ApiProperty({
    description: 'Detalle del progreso por módulo o tema',
    example: [
      { moduleId: 'uuid-modulo-1', progress: 80 },
      { moduleId: 'uuid-modulo-2', progress: 60 },
    ],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        moduleId: { type: 'string', example: 'uuid-modulo-x' },
        progress: { type: 'number', example: 70 },
      },
    },
    required: false,
  })
  moduleProgress?: Array<{ moduleId: string; progress: number }>;

  @ApiProperty({ description: 'Última fecha de actividad', example: '2023-10-26T10:00:00Z', required: false })
  lastActivityDate?: Date;
}
