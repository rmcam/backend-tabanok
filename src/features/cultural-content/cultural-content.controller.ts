import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CulturalContent } from './cultural-content.entity';
import { CulturalContentService } from './cultural-content.service';
import { CreateCulturalContentDto } from './dto/create-cultural-content.dto';
import { UpdateCulturalContentDto } from './dto/update-cultural-content.dto';

@ApiTags('Contenido Cultural')
@Controller('api/v1/cultural-content')
export class CulturalContentController {
    constructor(private readonly culturalContentService: CulturalContentService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo contenido cultural' })
    @ApiResponse({ status: 201, description: 'Contenido cultural creado exitosamente' })
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createCulturalContentDto: CreateCulturalContentDto): Promise<CulturalContent> {
        return this.culturalContentService.create(createCulturalContentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todo el contenido cultural' })
    @ApiResponse({ status: 200, description: 'Lista de contenido cultural' })
    findAll(): Promise<CulturalContent[]> {
        return this.culturalContentService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener contenido cultural por ID' })
    @ApiResponse({ status: 200, description: 'Contenido cultural encontrado' })
    @ApiResponse({ status: 404, description: 'Contenido cultural no encontrado' })
    findOne(@Param('id') id: string): Promise<CulturalContent> {
        return this.culturalContentService.findOne(id);
    }

    @Get('category/:category')
    @ApiOperation({ summary: 'Obtener contenido cultural por categoría' })
    @ApiResponse({ status: 200, description: 'Lista de contenido cultural por categoría' })
    findByCategory(@Param('category') category: string): Promise<CulturalContent[]> {
        return this.culturalContentService.findByCategory(category);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar contenido cultural' })
    @ApiResponse({ status: 200, description: 'Contenido cultural actualizado' })
    @ApiResponse({ status: 404, description: 'Contenido cultural no encontrado' })
    update(
        @Param('id') id: string,
        @Body() updateCulturalContentDto: UpdateCulturalContentDto,
    ): Promise<CulturalContent> {
        return this.culturalContentService.update(id, updateCulturalContentDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar contenido cultural' })
    @ApiResponse({ status: 204, description: 'Contenido cultural eliminado' })
    @ApiResponse({ status: 404, description: 'Contenido cultural no encontrado' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.culturalContentService.remove(id);
    }
} 