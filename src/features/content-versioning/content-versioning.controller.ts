import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ContentVersioningService } from './content-versioning.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { ContentVersion } from './entities/content-version.entity';

@ApiTags('Versionado de Contenido')
@Controller('content-versioning')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContentVersioningController {
    constructor(private readonly versioningService: ContentVersioningService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva versión' })
    @ApiResponse({ status: 201, description: 'Versión creada exitosamente', type: ContentVersion })
    async create(@Body() createVersionDto: CreateVersionDto): Promise<ContentVersion> {
        return this.versioningService.create(createVersionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las versiones' })
    @ApiResponse({ status: 200, description: 'Lista de versiones', type: [ContentVersion] })
    async findAll(): Promise<ContentVersion[]> {
        return this.versioningService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una versión por ID' })
    @ApiResponse({ status: 200, description: 'Versión encontrada', type: ContentVersion })
    async findOne(@Param('id') id: string): Promise<ContentVersion> {
        return this.versioningService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una versión' })
    @ApiResponse({ status: 200, description: 'Versión actualizada exitosamente', type: ContentVersion })
    async update(
        @Param('id') id: string,
        @Body() updateVersionDto: UpdateVersionDto
    ): Promise<ContentVersion> {
        return this.versioningService.update(id, updateVersionDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una versión' })
    @ApiResponse({ status: 200, description: 'Versión eliminada exitosamente' })
    async remove(@Param('id') id: string): Promise<void> {
        return this.versioningService.remove(id);
    }

    @Get('content/:contentId')
    @ApiOperation({ summary: 'Obtener versiones por ID de contenido' })
    @ApiResponse({ status: 200, description: 'Lista de versiones del contenido', type: [ContentVersion] })
    async findByContentId(@Param('contentId') contentId: string): Promise<ContentVersion[]> {
        return this.versioningService.findByContentId(contentId);
    }

    @Post('merge')
    @ApiOperation({ summary: 'Fusionar dos versiones' })
    @ApiResponse({ status: 200, description: 'Fusión realizada exitosamente', type: ContentVersion })
    async merge(
        @Body() mergeDto: { sourceId: string; targetId: string }
    ): Promise<ContentVersion> {
        return this.versioningService.mergeVersions(mergeDto.sourceId, mergeDto.targetId);
    }

    @Post('branch')
    @ApiOperation({ summary: 'Crear una rama a partir de una versión' })
    @ApiResponse({ status: 201, description: 'Rama creada exitosamente', type: ContentVersion })
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
    @ApiOperation({ summary: 'Publicar una versión' })
    @ApiResponse({ status: 200, description: 'Versión publicada exitosamente', type: ContentVersion })
    async publish(
        @Param('id') id: string,
        @Body('author') author: string
    ): Promise<ContentVersion> {
        return this.versioningService.publishVersion(id, author);
    }

    @Get('compare')
    @ApiOperation({ summary: 'Comparar dos versiones' })
    @ApiResponse({ status: 200, description: 'Diferencias entre versiones encontradas' })
    async compare(
        @Body() compareDto: { versionId1: string; versionId2: string }
    ) {
        return this.versioningService.compareVersions(
            compareDto.versionId1,
            compareDto.versionId2
        );
    }
} 