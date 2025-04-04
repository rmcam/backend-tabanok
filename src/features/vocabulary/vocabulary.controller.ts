import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyService } from './vocabulary.service';

@ApiTags('vocabulary')
@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) { }

  @Post()
  @ApiOperation({
    summary: 'Crear vocabulario',
    description: 'Agrega una nueva palabra o frase al vocabulario del sistema'
  })
  @ApiResponse({
    status: 201,
    description: 'Vocabulario creado exitosamente',
    type: Vocabulary
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  create(@Body() createVocabularyDto: CreateVocabularyDto) {
    return this.vocabularyService.create(createVocabularyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar vocabulario',
    description: 'Obtiene la lista completa del vocabulario disponible'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vocabulario obtenida exitosamente',
    type: [Vocabulary]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  findAll() {
    return this.vocabularyService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener vocabulario',
    description: 'Obtiene una entrada específica del vocabulario por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la entrada de vocabulario',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Entrada de vocabulario encontrada exitosamente',
    type: Vocabulary
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Entrada de vocabulario no encontrada'
  })
  findOne(@Param('id') id: string) {
    return this.vocabularyService.findOne(id);
  }

  @Get('topic/:topicId')
  @ApiOperation({
    summary: 'Obtener vocabulario por tema',
    description: 'Obtiene todas las entradas de vocabulario relacionadas con un tema específico'
  })
  @ApiParam({
    name: 'topicId',
    description: 'ID del tema',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vocabulario por tema obtenida exitosamente',
    type: [Vocabulary]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Tema no encontrado'
  })
  findByTopic(@Param('topicId') topicId: string) {
    return this.vocabularyService.findByTopic(topicId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar en el diccionario Kamëntsá',
    description: 'Busca palabras en el diccionario Kamëntsá con filtros y paginación'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de la búsqueda',
    type: [Vocabulary]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  search(
    @Param('term') term: string,
    @Param('page') page = 1,
    @Param('limit') limit = 20,
    @Param('tipo') tipo?: string,
    @Param('topicId') topicId?: string
  ) {
    return this.vocabularyService.search(term, page, limit, tipo, topicId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar vocabulario',
    description: 'Actualiza una entrada existente del vocabulario'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la entrada de vocabulario a actualizar',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Entrada de vocabulario actualizada exitosamente',
    type: Vocabulary
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
    description: 'Entrada de vocabulario no encontrada'
  })
  update(@Param('id') id: string, @Body() updateVocabularyDto: UpdateVocabularyDto) {
    return this.vocabularyService.update(id, updateVocabularyDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar vocabulario',
    description: 'Elimina una entrada existente del vocabulario'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la entrada de vocabulario a eliminar',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Entrada de vocabulario eliminada exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Entrada de vocabulario no encontrada'
  })
  remove(@Param('id') id: string) {
    return this.vocabularyService.remove(id);
  }
}
