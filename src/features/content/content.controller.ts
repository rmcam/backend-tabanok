import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Controller('learning-content')
@ApiTags('learning-content')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.MODERATOR)
    @ApiOperation({
        summary: 'Crear contenido',
        description: 'Crea un nuevo contenido educativo en el sistema'
    })
    @ApiBody({ type: CreateContentDto })
    @ApiResponse({
        status: 201,
        description: 'Contenido creado exitosamente',
        type: CreateContentDto
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos suficientes para realizar esta acción'
    })
    create(@Body() createContentDto: CreateContentDto) {
        return this.contentService.create(createContentDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar contenido',
        description: 'Obtiene la lista de todo el contenido educativo disponible'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de contenido obtenida exitosamente',
        type: [CreateContentDto]
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    findAll() {
        return this.contentService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener contenido',
        description: 'Obtiene un contenido educativo específico por su identificador'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Contenido obtenido exitosamente',
        type: CreateContentDto
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido no encontrado'
    })
    findOne(@Param('id') id: string) {
        return this.contentService.findOne(id);
    }

    @Get('lesson/:lessonId')
    @ApiOperation({
        summary: 'Obtener contenido por lección',
        description: 'Obtiene todo el contenido asociado a una lección específica'
    })
    @ApiParam({
        name: 'lessonId',
        description: 'Identificador único de la lección',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Contenido de lección obtenido exitosamente',
        type: [CreateContentDto]
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Lección no encontrada'
    })
    findByLesson(@Param('lessonId') lessonId: string) {
        return this.contentService.findByLesson(lessonId);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MODERATOR)
    @ApiOperation({
        summary: 'Actualizar contenido',
        description: 'Actualiza un contenido educativo existente'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido',
        type: 'string'
    })
    @ApiBody({ type: UpdateContentDto })
    @ApiResponse({
        status: 200,
        description: 'Contenido actualizado exitosamente',
        type: UpdateContentDto
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos suficientes para realizar esta acción'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido no encontrado'
    })
    update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
        return this.contentService.update(id, updateContentDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Eliminar contenido',
        description: 'Elimina un contenido educativo del sistema'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Contenido eliminado exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos de administrador para realizar esta acción'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido no encontrado'
    })
    remove(@Param('id') id: string) {
        return this.contentService.remove(id);
    }
}
