import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsUUID, IsOptional, Min, Max } from 'class-validator';

export class CreateUserModuleProgressDto {
    @ApiProperty({ description: 'ID del usuario', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    @IsUUID()
    userId: string;

    @ApiProperty({ description: 'ID del módulo', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    moduleId: string;

    @ApiProperty({ description: 'Indica si el módulo ha sido completado por el usuario', example: true, required: false })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;

    @ApiProperty({ description: 'Porcentaje de completitud del módulo', example: 75.5, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    completionPercentage?: number;

    @ApiProperty({ description: 'Puntaje total acumulado en el módulo', example: 500, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    score?: number;

    @ApiProperty({ description: 'Indica si el progreso del módulo está activo', example: true, required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
