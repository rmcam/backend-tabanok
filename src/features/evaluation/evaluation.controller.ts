import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
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
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
        return this.evaluationService.create(createEvaluationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las evaluaciones' })
    @ApiResponse({ status: 200, description: 'Lista de evaluaciones', type: [Evaluation] })
    findAll(): Promise<Evaluation[]> {
        return this.evaluationService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener evaluación por ID' })
    @ApiParam({ name: 'id', description: 'ID de la evaluación' })
    @ApiResponse({ status: 200, description: 'Evaluación encontrada', type: Evaluation })
    @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
    findOne(@Param('id') id: string): Promise<Evaluation> {
        return this.evaluationService.findOne(id);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Obtener evaluaciones por usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Lista de evaluaciones del usuario', type: [Evaluation] })
    findByUserId(@Param('userId') userId: string): Promise<Evaluation[]> {
        return this.evaluationService.findByUserId(userId);
    }

    @Get('progress/:userId')
    @ApiOperation({ summary: 'Obtener progreso del usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Progreso del usuario', schema: { type: 'object', properties: { /* Aquí irían las propiedades del objeto de progreso */ } } })
    getUserProgress(@Param('userId') userId: string): Promise<any> {
        return this.evaluationService.findUserProgress(userId);
    }
}
