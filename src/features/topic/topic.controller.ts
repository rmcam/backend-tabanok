import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicService } from './topic.service';

@ApiTags('topics')
@Controller('topics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TopicController {
  constructor(private readonly topicService: TopicService) { }

  @Post()
  @ApiOperation({
    summary: 'Crear tema',
    description: 'Crea un nuevo tema de aprendizaje en el sistema'
  })
  @ApiBody({ type: CreateTopicDto })
  @ApiResponse({
    status: 201,
    description: 'Tema creado exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicService.create(createTopicDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar temas',
    description: 'Obtiene todos los temas de aprendizaje disponibles en el sistema'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de temas obtenida exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  findAll() {
    return this.topicService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener tema',
    description: 'Obtiene los detalles de un tema específico por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del tema',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Tema encontrado exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Tema no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.topicService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar tema',
    description: 'Actualiza la información de un tema existente'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del tema',
    type: 'string'
  })
  @ApiBody({ type: UpdateTopicDto })
  @ApiResponse({
    status: 200,
    description: 'Tema actualizado exitosamente'
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
    description: 'Tema no encontrado'
  })
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    return this.topicService.update(id, updateTopicDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar tema',
    description: 'Elimina un tema existente del sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del tema',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Tema eliminado exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Tema no encontrado'
  })
  remove(@Param('id') id: string) {
    return this.topicService.remove(id);
  }
}
