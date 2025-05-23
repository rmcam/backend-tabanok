import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsObject, IsOptional, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProgressMetricsDto } from './progress-metrics.dto'; // Importar el nuevo DTO

export class CreateEvaluationDto {
    @ApiProperty({ description: 'ID del usuario que realiza la evaluación', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @IsNotEmpty({ message: 'El ID del usuario es requerido' })
    @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
    userId: string;

    @ApiProperty({ description: 'ID del contenido cultural evaluado', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    @IsNotEmpty({ message: 'El ID del contenido cultural es requerido' })
    @IsUUID('4', { message: 'El ID del contenido cultural debe ser un UUID válido' })
    culturalContentId: string;

    @ApiProperty({ description: 'Puntaje obtenido en la evaluación (0-100)', example: 85 })
    @IsNotEmpty({ message: 'El puntaje es requerido' })
    @IsInt({ message: 'El puntaje debe ser un número entero' })
    @Min(0, { message: 'El puntaje mínimo es 0' })
    @Max(100, { message: 'El puntaje máximo es 100' })
    score: number;

    @ApiProperty({ description: 'Respuestas del usuario', example: { question1: 'answerA', question2: 'answerB' }, required: false })
    @IsOptional()
    @IsObject({ message: 'Las respuestas deben ser un objeto válido' })
    answers?: Record<string, any>; // Considerar un DTO más específico si la estructura es fija

    @ApiProperty({ description: 'Tiempo empleado en segundos', example: 120 })
    @IsNotEmpty({ message: 'El tiempo empleado es requerido' })
    @IsInt({ message: 'El tiempo debe ser un número entero' })
    @Min(0, { message: 'El tiempo no puede ser negativo' })
    timeSpentSeconds: number;

    @ApiProperty({ description: 'Métricas de progreso', required: false, type: ProgressMetricsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => ProgressMetricsDto)
    progressMetrics?: ProgressMetricsDto;

    @ApiProperty({ description: 'Retroalimentación de la evaluación', example: 'Buen trabajo en la pronunciación', required: false })
    @IsOptional()
    feedback?: string;
}
