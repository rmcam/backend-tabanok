import { ApiProperty } from '@nestjs/swagger';

export class ProgressDto {
    @ApiProperty({ description: 'ID único del progreso', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    id: string;

    @ApiProperty({ description: 'ID del usuario', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    userId: string;

    @ApiProperty({ description: 'ID del ejercicio', example: '123e4567-e89b-12d3-a456-426614174000' })
    exerciseId: string;

    @ApiProperty({ description: 'Puntaje obtenido en el progreso', example: 85 })
    score: number;

    @ApiProperty({ description: 'Indica si el progreso ha sido completado', example: true })
    isCompleted: boolean;

    @ApiProperty({ description: 'Fecha de creación del progreso', example: '2023-01-01T10:00:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización del progreso', example: '2023-01-01T11:00:00Z' })
    updatedAt: Date;
}
