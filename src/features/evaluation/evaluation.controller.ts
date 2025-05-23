import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UserProgressDto } from './dto/user-progress.dto'; // Importar el nuevo DTO
import { Evaluation } from './evaluation.entity';
import { EvaluationService } from './evaluation.service';

@ApiTags('evaluations')
@Controller('evaluations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva evaluación' })
    @ApiBody({ type: CreateEvaluationDto })
    @ApiResponse({ status: 201, description: 'Evaluación creada exitosamente', type: Evaluation })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
        return this.evaluationService.create(createEvaluationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las evaluaciones' })
    @ApiResponse({ status: 200, description: 'Lista de evaluaciones', type: [Evaluation] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    findAll(): Promise<Evaluation[]> {
        return this.evaluationService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener evaluación por ID' })
    @ApiParam({ name: 'id', description: 'ID de la evaluación', type: String })
    @ApiResponse({ status: 200, description: 'Evaluación encontrada', type: Evaluation })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
    findOne(@Param('id') id: string): Promise<Evaluation> {
        return this.evaluationService.findOne(id);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Obtener evaluaciones por usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario', type: String })
    @ApiResponse({ status: 200, description: 'Lista de evaluaciones del usuario', type: [Evaluation] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    findByUserId(@Param('userId') userId: string): Promise<Evaluation[]> {
        return this.evaluationService.findByUserId(userId);
    }

    @Get('progress/:userId')
    @ApiOperation({ summary: 'Obtener progreso del usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario', type: String })
    @ApiResponse({ status: 200, description: 'Progreso del usuario', type: UserProgressDto })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    getUserProgress(@Param('userId') userId: string): Promise<UserProgressDto> {
        return this.evaluationService.findUserProgress(userId);
    }
}
