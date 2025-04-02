import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards, DefaultValuePipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CulturalContent } from './cultural-content.entity';
import { CulturalContentService } from './cultural-content.service';
import { CreateCulturalContentDto } from './dto/create-cultural-content.dto';
import { UpdateCulturalContentDto } from './dto/update-cultural-content.dto';

@ApiTags('cultural-content')
@Controller('api/v1/cultural-content')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CulturalContentController {
    constructor(private readonly culturalContentService: CulturalContentService) { }

    @Post()
    @ApiOperation({
        summary: 'Crear contenido cultural',
        description: 'Crea un nuevo contenido cultural en el sistema'
    })
    @ApiResponse({
        status: 201,
        description: 'Contenido cultural creado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createCulturalContentDto: CreateCulturalContentDto): Promise<CulturalContent> {
        return this.culturalContentService.create(createCulturalContentDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar contenido cultural',
        description: 'Obtiene todo el contenido cultural disponible en el sistema'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de contenido cultural obtenida exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    findAll(
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
        @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number
    ): Promise<CulturalContent[]> {
        return this.culturalContentService.findAll({ skip, take });
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener contenido cultural',
        description: 'Obtiene los detalles de un contenido cultural específico por su ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido cultural',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Contenido cultural encontrado exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido cultural no encontrado'
    })
    findOne(@Param('id') id: string): Promise<CulturalContent> {
        return this.culturalContentService.findOne(id);
    }

    @Get('category/:category')
    @ApiOperation({
        summary: 'Obtener contenido por categoría',
        description: 'Obtiene todo el contenido cultural de una categoría específica'
    })
    @ApiParam({
        name: 'category',
        description: 'Categoría del contenido cultural',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de contenido cultural por categoría obtenida exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    findByCategory(@Param('category') category: string): Promise<CulturalContent[]> {
        return this.culturalContentService.findByCategory(category);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Actualizar contenido cultural',
        description: 'Actualiza la información de un contenido cultural existente'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido cultural',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Contenido cultural actualizado exitosamente'
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
        description: 'Contenido cultural no encontrado'
    })
    update(
        @Param('id') id: string,
        @Body() updateCulturalContentDto: UpdateCulturalContentDto,
    ): Promise<CulturalContent> {
        return this.culturalContentService.update(id, updateCulturalContentDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar contenido cultural',
        description: 'Elimina un contenido cultural existente del sistema'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido cultural',
        type: 'string'
    })
    @ApiResponse({
        status: 204,
        description: 'Contenido cultural eliminado exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido cultural no encontrado'
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.culturalContentService.remove(id);
    }
}
