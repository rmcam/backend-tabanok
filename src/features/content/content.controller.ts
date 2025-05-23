import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/auth.enum';
import { Content } from './entities/content.entity'; // Asumiendo que existe una entidad Content

@ApiTags('learning-content')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Post()
  @ApiOperation({ summary: 'Crear nuevo contenido educativo' })
  @ApiBody({ type: CreateContentDto })
  @ApiResponse({ status: 201, description: 'Contenido creado exitosamente', type: Content })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
  create(@Body() createContentDto: CreateContentDto) {
    return this.contentService.create(createContentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todo el contenido educativo' })
  @ApiResponse({ status: 200, description: 'Lista de contenido obtenida exitosamente', type: [Content] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll() {
    return this.contentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener contenido por ID' })
  @ApiParam({ name: 'id', description: 'ID del contenido', type: String })
  @ApiResponse({ status: 200, description: 'Contenido obtenido exitosamente', type: Content })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Contenido no encontrado' })
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar contenido por ID' })
  @ApiParam({ name: 'id', description: 'ID del contenido a actualizar', type: String })
  @ApiBody({ type: UpdateContentDto })
  @ApiResponse({ status: 200, description: 'Contenido actualizado exitosamente', type: Content })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Contenido no encontrado' })
  update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    return this.contentService.update(+id, updateContentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar contenido por ID' })
  @ApiParam({ name: 'id', description: 'ID del contenido a eliminar', type: String })
  @ApiResponse({ status: 200, description: 'Contenido eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Contenido no encontrado' })
  remove(@Param('id') id: string) {
    return this.contentService.remove(+id);
  }

  @Get('unity/:unityId/topic/:topicId')
  @ApiOperation({ summary: 'Obtener contenido por ID de unidad y ID de tema' })
  @ApiParam({ name: 'unityId', description: 'ID de la unidad', type: String })
  @ApiParam({ name: 'topicId', description: 'ID del tema', type: String })
  @ApiResponse({ status: 200, description: 'Contenido obtenido exitosamente', type: [Content] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Unidad o tema no encontrado' })
  findByUnityAndTopic(@Param('unityId') unityId: string, @Param('topicId') topicId: string) {
    return this.contentService.findByUnityAndTopic(unityId, topicId);
  }
}
