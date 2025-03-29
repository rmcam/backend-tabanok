import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ContentVersioningService } from './content-versioning.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { ContentVersion } from './entities/content-version.entity';

@ApiTags('version-content')
@Controller('content-versioning')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContentVersioningController {
    constructor(private readonly versioningService: ContentVersioningService) { }

    @Post()
    @ApiOperation({
        summary: 'Crear versión',
        description: 'Crea una nueva versión de contenido en el sistema'
    })
    @ApiResponse({
        status: 201,
        description: 'Versión creada exitosamente',
        type: ContentVersion
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async create(@Body() createVersionDto: CreateVersionDto): Promise<ContentVersion> {
        return this.versioningService.create(createVersionDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar versiones',
        description: 'Obtiene todas las versiones de contenido disponibles en el sistema'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de versiones obtenida exitosamente',
        type: [ContentVersion]
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async findAll(): Promise<ContentVersion[]> {
        return this.versioningService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener versión',
        description: 'Obtiene los detalles de una versión específica por su ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la versión',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Versión encontrada exitosamente',
        type: ContentVersion
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Versión no encontrada'
    })
    async findOne(@Param('id') id: string): Promise<ContentVersion> {
        return this.versioningService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar versión',
        description: 'Actualiza la información de una versión existente'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la versión',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Versión actualizada exitosamente',
        type: ContentVersion
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
        status: 404,
        description: 'Versión no encontrada'
    })
    async update(
        @Param('id') id: string,
        @Body() updateVersionDto: UpdateVersionDto
    ): Promise<ContentVersion> {
        return this.versioningService.update(id, updateVersionDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar versión',
        description: 'Elimina una versión existente del sistema'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la versión',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Versión eliminada exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Versión no encontrada'
    })
    async remove(@Param('id') id: string): Promise<void> {
        return this.versioningService.remove(id);
    }

    @Get('content/:contentId')
    @ApiOperation({
        summary: 'Obtener versiones por contenido',
        description: 'Obtiene todas las versiones asociadas a un contenido específico'
    })
    @ApiParam({
        name: 'contentId',
        description: 'Identificador único del contenido',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de versiones obtenida exitosamente',
        type: [ContentVersion]
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido no encontrado'
    })
    async findByContentId(@Param('contentId') contentId: string): Promise<ContentVersion[]> {
        return this.versioningService.findByContentId(contentId);
    }

    @Post('merge')
    @ApiOperation({
        summary: 'Fusionar versiones',
        description: 'Combina dos versiones de contenido en una nueva versión'
    })
    @ApiResponse({
        status: 200,
        description: 'Versiones fusionadas exitosamente',
        type: ContentVersion
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
        status: 404,
        description: 'Una o ambas versiones no encontradas'
    })
    async merge(
        @Body() mergeDto: { sourceId: string; targetId: string }
    ): Promise<ContentVersion> {
        return this.versioningService.mergeVersions(mergeDto.sourceId, mergeDto.targetId);
    }

    @Post('branch')
    @ApiOperation({
        summary: 'Crear rama',
        description: 'Crea una nueva rama a partir de una versión existente'
    })
    @ApiResponse({
        status: 201,
        description: 'Rama creada exitosamente',
        type: ContentVersion
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
        status: 404,
        description: 'Versión base no encontrada'
    })
    async createBranch(
        @Body() branchDto: { versionId: string; branchName: string; author: string }
    ): Promise<ContentVersion> {
        return this.versioningService.createBranch(
            branchDto.versionId,
            branchDto.branchName,
            branchDto.author
        );
    }

    @Post('publish/:id')
    @ApiOperation({
        summary: 'Publicar versión',
        description: 'Publica una versión de contenido haciéndola disponible para los usuarios'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la versión',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Versión publicada exitosamente',
        type: ContentVersion
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
        status: 404,
        description: 'Versión no encontrada'
    })
    async publish(
        @Param('id') id: string,
        @Body('author') author: string
    ): Promise<ContentVersion> {
        return this.versioningService.publishVersion(id, author);
    }

    @Get('compare')
    @ApiOperation({
        summary: 'Comparar versiones',
        description: 'Compara dos versiones de contenido y muestra sus diferencias'
    })
    @ApiResponse({
        status: 200,
        description: 'Comparación realizada exitosamente'
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
        status: 404,
        description: 'Una o ambas versiones no encontradas'
    })
    async compare(
        @Body() compareDto: { versionId1: string; versionId2: string }
    ) {
        return this.versioningService.compareVersions(
            compareDto.versionId1,
            compareDto.versionId2
        );
    }
} 