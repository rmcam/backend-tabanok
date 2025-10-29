import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetUserProgressFilterDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'ID del módulo (UUID)', type: String })
    @IsOptional()
    @IsUUID()
    moduleId?: string;

    @ApiPropertyOptional({ description: 'ID de la unidad (UUID)', type: String })
    @IsOptional()
    @IsUUID()
    unityId?: string;

    @ApiPropertyOptional({ description: 'ID de la lección (UUID)', type: String })
    @IsOptional()
    @IsUUID()
    lessonId?: string;

    @ApiPropertyOptional({ description: 'ID del ejercicio (UUID)', type: String })
    @IsOptional()
    @IsUUID()
    exerciseId?: string;

    @ApiPropertyOptional({ description: 'Incluir progreso de ejercicios (true/false)', type: Boolean })
    @IsOptional()
    @IsBoolean()
    includeExercises?: boolean;

    @ApiPropertyOptional({ description: 'Incluir progreso de todos los módulos (true/false)', type: Boolean })
    @IsOptional()
    @IsBoolean()
    includeModules?: boolean;
}
