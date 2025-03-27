import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsObject, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateEvaluationDto {
    @ApiProperty({ description: 'ID del usuario que realiza la evaluación' })
    @IsNotEmpty({ message: 'El ID del usuario es requerido' })
    @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
    userId: string;

    @ApiProperty({ description: 'ID del contenido cultural evaluado' })
    @IsNotEmpty({ message: 'El ID del contenido cultural es requerido' })
    @IsUUID('4', { message: 'El ID del contenido cultural debe ser un UUID válido' })
    culturalContentId: string;

    @ApiProperty({ description: 'Puntaje obtenido en la evaluación (0-100)' })
    @IsNotEmpty({ message: 'El puntaje es requerido' })
    @IsInt({ message: 'El puntaje debe ser un número entero' })
    @Min(0, { message: 'El puntaje mínimo es 0' })
    @Max(100, { message: 'El puntaje máximo es 100' })
    score: number;

    @ApiProperty({ description: 'Respuestas del usuario', required: false })
    @IsOptional()
    @IsObject({ message: 'Las respuestas deben ser un objeto válido' })
    answers?: Record<string, any>;

    @ApiProperty({ description: 'Tiempo empleado en segundos' })
    @IsNotEmpty({ message: 'El tiempo empleado es requerido' })
    @IsInt({ message: 'El tiempo debe ser un número entero' })
    @Min(0, { message: 'El tiempo no puede ser negativo' })
    timeSpentSeconds: number;

    @ApiProperty({ description: 'Métricas de progreso', required: false })
    @IsOptional()
    @IsObject({ message: 'Las métricas de progreso deben ser un objeto válido' })
    progressMetrics?: {
        pronunciation: number;
        comprehension: number;
        writing: number;
        vocabulary: number;
    };

    @ApiProperty({ description: 'Retroalimentación de la evaluación', required: false })
    @IsOptional()
    feedback?: string;
} 