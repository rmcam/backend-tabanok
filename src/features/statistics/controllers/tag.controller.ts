import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateTagDto, TagResponseDto, UpdateTagDto } from '../dto/tag.dto';
import { TagType } from '../interfaces/tag.interface';
import { TagService } from '../services/tag.service';

@ApiTags('tags')
@Controller('tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagController {
    constructor(private readonly tagService: TagService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva etiqueta' })
    @ApiResponse({ status: 201, description: 'Etiqueta creada exitosamente', type: TagResponseDto })
    async create(@Body() createTagDto: CreateTagDto) {
        return this.tagService.create(createTagDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las etiquetas' })
    @ApiResponse({ status: 200, description: 'Lista de etiquetas', type: [TagResponseDto] })
    async findAll() {
        return this.tagService.findAll();
    }

    @Get('search')
    @ApiOperation({ summary: 'Buscar etiquetas por texto' })
    @ApiResponse({ status: 200, description: 'Etiquetas encontradas', type: [TagResponseDto] })
    async search(@Query('query') query: string) {
        return this.tagService.searchTags(query);
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Obtener etiquetas por tipo' })
    @ApiResponse({ status: 200, description: 'Etiquetas del tipo especificado', type: [TagResponseDto] })
    async findByType(@Param('type') type: TagType) {
        return this.tagService.findByType(type);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una etiqueta por ID' })
    @ApiResponse({ status: 200, description: 'Etiqueta encontrada', type: TagResponseDto })
    @ApiResponse({ status: 404, description: 'Etiqueta no encontrada' })
    async findOne(@Param('id') id: string) {
        return this.tagService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una etiqueta' })
    @ApiResponse({ status: 200, description: 'Etiqueta actualizada', type: TagResponseDto })
    @ApiResponse({ status: 404, description: 'Etiqueta no encontrada' })
    async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
        return this.tagService.update(id, updateTagDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una etiqueta' })
    @ApiResponse({ status: 200, description: 'Etiqueta eliminada' })
    @ApiResponse({ status: 404, description: 'Etiqueta no encontrada' })
    async remove(@Param('id') id: string) {
        return this.tagService.delete(id);
    }

    @Put(':id/increment-usage')
    @ApiOperation({ summary: 'Incrementar el contador de uso de una etiqueta' })
    @ApiResponse({ status: 200, description: 'Contador incrementado', type: TagResponseDto })
    async incrementUsage(@Param('id') id: string) {
        return this.tagService.incrementUsageCount(id);
    }

    @Put(':id/decrement-usage')
    @ApiOperation({ summary: 'Decrementar el contador de uso de una etiqueta' })
    @ApiResponse({ status: 200, description: 'Contador decrementado', type: TagResponseDto })
    async decrementUsage(@Param('id') id: string) {
        return this.tagService.decrementUsageCount(id);
    }
} 