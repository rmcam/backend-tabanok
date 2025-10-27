import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateUserLessonProgressDto {
    @ApiProperty({ description: 'ID del usuario', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    @IsUUID()
    userId: string;

    @ApiProperty({ description: 'ID de la lección', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    lessonId: string;

    @ApiProperty({ description: 'Indica si la lección ha sido completada por el usuario', example: false, required: false })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;

    @ApiProperty({ description: 'Porcentaje de completitud de la lección', example: 75.5, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    completionPercentage?: number;

    @ApiProperty({ description: 'Puntuación total obtenida en la lección', example: 150, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    score?: number;
}
