import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    ParseUUIDPipe,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateLevelDto } from './dto/create-level.dto';
import { Level, LevelType } from './entities/level.entity';
import { LevelService } from './level.service';

@ApiTags('Niveles')
@ApiBearerAuth()
@Controller('levels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LevelController {
    constructor(private readonly levelService: LevelService) { }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Crear un nuevo nivel' })
    @ApiResponse({ status: 201, description: 'Nivel creado exitosamente', type: Level })
    create(@Body() createLevelDto: CreateLevelDto): Promise<Level> {
        return this.levelService.create(createLevelDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los niveles' })
    @ApiResponse({ status: 200, description: 'Lista de niveles', type: [Level] })
    findAll(): Promise<Level[]> {
        return this.levelService.findAll();
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Obtener niveles por tipo' })
    @ApiParam({ name: 'type', enum: LevelType, description: 'Tipo de nivel' })
    @ApiResponse({ status: 200, description: 'Lista de niveles del tipo especificado', type: [Level] })
    findByType(@Param('type', new ParseEnumPipe(LevelType)) type: LevelType): Promise<Level[]> {
        return this.levelService.findByType(type);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un nivel por ID' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'ID del nivel' })
    @ApiResponse({ status: 200, description: 'Nivel encontrado', type: Level })
    findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Level> {
        return this.levelService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Actualizar un nivel' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'ID del nivel' })
    @ApiResponse({ status: 200, description: 'Nivel actualizado', type: Level })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateLevelDto: Partial<CreateLevelDto>,
    ): Promise<Level> {
        return this.levelService.update(id, updateLevelDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Eliminar un nivel' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'ID del nivel' })
    @ApiResponse({ status: 200, description: 'Nivel eliminado' })
    remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.levelService.remove(id);
    }

    @Post('type/:type/reorder')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Reordenar niveles de un tipo específico' })
    @ApiParam({ name: 'type', enum: LevelType, description: 'Tipo de nivel' })
    @ApiResponse({ status: 200, description: 'Niveles reordenados' })
    reorderLevels(@Param('type', new ParseEnumPipe(LevelType)) type: LevelType): Promise<void> {
        return this.levelService.reorderLevels(type);
    }

    @Put(':id/unlock')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Desbloquear un nivel' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'ID del nivel' })
    @ApiResponse({ status: 200, description: 'Nivel desbloqueado', type: Level })
    unlockLevel(@Param('id', ParseUUIDPipe) id: string): Promise<Level> {
        return this.levelService.unlockLevel(id);
    }

    @Put(':id/lock')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Bloquear un nivel' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'ID del nivel' })
    @ApiResponse({ status: 200, description: 'Nivel bloqueado', type: Level })
    lockLevel(@Param('id', ParseUUIDPipe) id: string): Promise<Level> {
        return this.levelService.lockLevel(id);
    }

    @Put(':id/points/:points')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Actualizar puntos requeridos para un nivel' })
    @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'ID del nivel' })
    @ApiParam({ name: 'points', type: 'number', description: 'Puntos requeridos' })
    @ApiResponse({ status: 200, description: 'Puntos actualizados', type: Level })
    updateRequiredPoints(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('points', ParseIntPipe) points: number,
    ): Promise<Level> {
        return this.levelService.updateRequiredPoints(id, points);
    }
} 