import { ApiProperty } from '@nestjs/swagger';

export class UserModuleProgressDto {
    @ApiProperty({ description: 'ID único del progreso del módulo de usuario', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    id: string;

    @ApiProperty({ description: 'ID del usuario', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    userId: string;

    @ApiProperty({ description: 'ID del módulo', example: '123e4567-e89b-12d3-a456-426614174000' })
    moduleId: string;

    @ApiProperty({ description: 'Indica si el módulo ha sido completado por el usuario', example: true })
    isCompleted: boolean;

    @ApiProperty({ description: 'Porcentaje de completitud del módulo', example: 75.5 })
    completionPercentage: number;

    @ApiProperty({ description: 'Puntaje total acumulado en el módulo', example: 500 })
    score: number;

    @ApiProperty({ description: 'Fecha de creación del progreso del módulo', example: '2023-01-01T10:00:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización del progreso del módulo', example: '2023-01-01T11:00:00Z' })
    updatedAt: Date;
}
