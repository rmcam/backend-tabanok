import { ApiProperty } from '@nestjs/swagger';

export class UserLessonProgressDto {
    @ApiProperty({ description: 'ID único del progreso de lección de usuario', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    id: string;

    @ApiProperty({ description: 'ID del usuario', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    userId: string;

    @ApiProperty({ description: 'ID de la lección', example: '123e4567-e89b-12d3-a456-426614174000' })
    lessonId: string;

    @ApiProperty({ description: 'Indica si la lección ha sido completada por el usuario', example: false })
    isCompleted: boolean;

    @ApiProperty({ description: 'Porcentaje de completitud de la lección', example: 75.5 })
    completionPercentage: number;

    @ApiProperty({ description: 'Puntuación total obtenida en la lección', example: 150 })
    score: number;

    @ApiProperty({ description: 'Número de ejercicios completados en la lección', example: 5 })
    completedExercisesCount: number;

    @ApiProperty({ description: 'Fecha de creación del registro', example: '2023-01-01T10:00:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización del registro', example: '2023-01-01T11:00:00Z' })
    updatedAt: Date;
}
