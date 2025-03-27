import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyService } from './vocabulary.service';

@ApiTags('Vocabulario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear nuevo vocabulario' })
  @ApiResponse({ status: 201, description: 'Vocabulario creado exitosamente' })
  create(@Body() createVocabularyDto: CreateVocabularyDto): Promise<Vocabulary> {
    return this.vocabularyService.create(createVocabularyDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener todo el vocabulario' })
  @ApiResponse({ status: 200, description: 'Lista de vocabulario' })
  findAll(): Promise<Vocabulary[]> {
    return this.vocabularyService.findAll();
  }

  @Get('random')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener vocabulario aleatorio' })
  @ApiResponse({ status: 200, description: 'Lista de vocabulario aleatorio' })
  getRandomVocabulary(
    @Query('limit', ParseIntPipe) limit: number = 5,
  ): Promise<Vocabulary[]> {
    return this.vocabularyService.getRandomVocabulary(limit);
  }

  @Get('topic/:topicId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener vocabulario por tema' })
  @ApiResponse({ status: 200, description: 'Lista de vocabulario del tema especificado' })
  findByTopic(@Param('topicId', ParseUUIDPipe) topicId: string): Promise<Vocabulary[]> {
    return this.vocabularyService.findByTopic(topicId);
  }

  @Get('difficulty/:level')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener vocabulario por nivel de dificultad' })
  @ApiResponse({ status: 200, description: 'Lista de vocabulario del nivel especificado' })
  findByDifficultyLevel(
    @Param('level', ParseIntPipe) level: number,
  ): Promise<Vocabulary[]> {
    return this.vocabularyService.findByDifficultyLevel(level);
  }

  @Get('category/:category')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener vocabulario por categoría' })
  @ApiResponse({ status: 200, description: 'Lista de vocabulario de la categoría especificada' })
  findByCategory(@Param('category') category: string): Promise<Vocabulary[]> {
    return this.vocabularyService.findByCategory(category);
  }

  @Get('search')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Buscar vocabulario' })
  @ApiResponse({ status: 200, description: 'Lista de vocabulario que coincide con el término de búsqueda' })
  search(@Query('term') term: string): Promise<Vocabulary[]> {
    return this.vocabularyService.search(term);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Obtener vocabulario por ID' })
  @ApiResponse({ status: 200, description: 'Vocabulario encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Vocabulary> {
    return this.vocabularyService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar vocabulario' })
  @ApiResponse({ status: 200, description: 'Vocabulario actualizado exitosamente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVocabularyDto: UpdateVocabularyDto,
  ): Promise<Vocabulary> {
    return this.vocabularyService.update(id, updateVocabularyDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar vocabulario' })
  @ApiResponse({ status: 200, description: 'Vocabulario eliminado exitosamente' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.vocabularyService.remove(id);
  }
} 