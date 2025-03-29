import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { Evaluation } from './evaluation.entity';
import { EvaluationService } from './evaluation.service';

@ApiTags('evaluations')
@Controller('api/v1/evaluations')
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nueva evaluación' })
    @ApiResponse({ status: 201, description: 'Evaluación creada exitosamente' })
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
        return this.evaluationService.create(createEvaluationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las evaluaciones' })
    @ApiResponse({ status: 200, description: 'Lista de evaluaciones' })
    findAll(): Promise<Evaluation[]> {
        return this.evaluationService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener evaluación por ID' })
    @ApiResponse({ status: 200, description: 'Evaluación encontrada' })
    @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
    findOne(@Param('id') id: string): Promise<Evaluation> {
        return this.evaluationService.findOne(id);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Obtener evaluaciones por usuario' })
    @ApiResponse({ status: 200, description: 'Lista de evaluaciones del usuario' })
    findByUserId(@Param('userId') userId: string): Promise<Evaluation[]> {
        return this.evaluationService.findByUserId(userId);
    }

    @Get('progress/:userId')
    @ApiOperation({ summary: 'Obtener progreso del usuario' })
    @ApiResponse({ status: 200, description: 'Progreso del usuario' })
    getUserProgress(@Param('userId') userId: string): Promise<any> {
        return this.evaluationService.findUserProgress(userId);
    }
} 