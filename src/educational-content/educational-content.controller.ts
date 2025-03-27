import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateContentDto } from './dto/create-content.dto';
import { EducationalContentService } from './educational-content.service';
import { EducationalContent } from './entities/content.entity';

@ApiTags('Contenido Educativo')
@Controller('educational-content')
export class EducationalContentController {
    constructor(private readonly educationalContentService: EducationalContentService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo contenido educativo' })
    @ApiResponse({ status: 201, description: 'Contenido creado exitosamente' })
    create(@Body() createContentDto: CreateContentDto): Promise<EducationalContent> {
        return this.educationalContentService.create(createContentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todo el contenido educativo' })
    @ApiResponse({ status: 200, description: 'Lista de contenido educativo' })
    findAll(): Promise<EducationalContent[]> {
        return this.educationalContentService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener contenido educativo por ID' })
    @ApiResponse({ status: 200, description: 'Contenido educativo encontrado' })
    findOne(@Param('id') id: string): Promise<EducationalContent> {
        return this.educationalContentService.findOne(id);
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Obtener contenido educativo por tipo' })
    @ApiResponse({ status: 200, description: 'Lista de contenido educativo por tipo' })
    findByType(@Param('type') type: string): Promise<EducationalContent[]> {
        return this.educationalContentService.findByType(type);
    }

    @Get('level/:level')
    @ApiOperation({ summary: 'Obtener contenido educativo por nivel' })
    @ApiResponse({ status: 200, description: 'Lista de contenido educativo por nivel' })
    findByLevel(@Param('level') level: number): Promise<EducationalContent[]> {
        return this.educationalContentService.findByLevel(level);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar contenido educativo' })
    @ApiResponse({ status: 200, description: 'Contenido educativo actualizado' })
    update(
        @Param('id') id: string,
        @Body() updateContentDto: Partial<CreateContentDto>,
    ): Promise<EducationalContent> {
        return this.educationalContentService.update(id, updateContentDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar contenido educativo' })
    @ApiResponse({ status: 200, description: 'Contenido educativo eliminado' })
    remove(@Param('id') id: string): Promise<void> {
        return this.educationalContentService.remove(id);
    }
} 