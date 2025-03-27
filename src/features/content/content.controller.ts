import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { Content, ContentType } from './entities/content.entity';

@ApiTags('Contenido')
@ApiBearerAuth()
@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    @Post()
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Crear nuevo contenido' })
    @ApiResponse({ status: 201, description: 'Contenido creado exitosamente', type: Content })
    create(@Body() createContentDto: CreateContentDto): Promise<Content> {
        return this.contentService.create(createContentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todo el contenido' })
    @ApiResponse({ status: 200, description: 'Lista de contenido', type: [Content] })
    findAll(): Promise<Content[]> {
        return this.contentService.findAll();
    }

    @Get('lesson/:lessonId')
    @ApiOperation({ summary: 'Obtener contenido por lección' })
    @ApiParam({ name: 'lessonId', type: 'number', description: 'ID de la lección' })
    @ApiResponse({ status: 200, description: 'Lista de contenido de la lección', type: [Content] })
    findByLesson(@Param('lessonId', ParseIntPipe) lessonId: number): Promise<Content[]> {
        return this.contentService.findByLesson(lessonId);
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Obtener contenido por tipo' })
    @ApiParam({ name: 'type', enum: ContentType, description: 'Tipo de contenido' })
    @ApiResponse({ status: 200, description: 'Lista de contenido del tipo especificado', type: [Content] })
    findByType(@Param('type', new ParseEnumPipe(ContentType)) type: ContentType): Promise<Content[]> {
        return this.contentService.findByType(type);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener contenido por ID' })
    @ApiParam({ name: 'id', type: 'number', description: 'ID del contenido' })
    @ApiResponse({ status: 200, description: 'Contenido encontrado', type: Content })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Content> {
        return this.contentService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Actualizar contenido' })
    @ApiParam({ name: 'id', type: 'number', description: 'ID del contenido' })
    @ApiResponse({ status: 200, description: 'Contenido actualizado', type: Content })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateContentDto: Partial<CreateContentDto>,
    ): Promise<Content> {
        return this.contentService.update(id, updateContentDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Eliminar contenido' })
    @ApiParam({ name: 'id', type: 'number', description: 'ID del contenido' })
    @ApiResponse({ status: 200, description: 'Contenido eliminado' })
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.contentService.remove(id);
    }

    @Post('lesson/:lessonId/reorder')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Reordenar contenido de una lección' })
    @ApiParam({ name: 'lessonId', type: 'number', description: 'ID de la lección' })
    @ApiResponse({ status: 200, description: 'Contenido reordenado' })
    reorderContents(@Param('lessonId', ParseIntPipe) lessonId: number): Promise<void> {
        return this.contentService.reorderContents(lessonId);
    }

    @Put(':id/toggle-active')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Alternar estado activo del contenido' })
    @ApiParam({ name: 'id', type: 'number', description: 'ID del contenido' })
    @ApiResponse({ status: 200, description: 'Estado activo actualizado', type: Content })
    toggleActive(@Param('id', ParseIntPipe) id: number): Promise<Content> {
        return this.contentService.toggleActive(id);
    }

    @Put(':id/duration/:duration')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Actualizar duración del contenido' })
    @ApiParam({ name: 'id', type: 'number', description: 'ID del contenido' })
    @ApiParam({ name: 'duration', type: 'number', description: 'Duración en segundos' })
    @ApiResponse({ status: 200, description: 'Duración actualizada', type: Content })
    updateDuration(
        @Param('id', ParseIntPipe) id: number,
        @Param('duration', ParseIntPipe) duration: number,
    ): Promise<Content> {
        return this.contentService.updateDuration(id, duration);
    }
} 