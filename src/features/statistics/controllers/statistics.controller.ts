import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { StatisticsService } from '../services/statistics.service';
import { CreateStatisticsDto } from '../dto/create-statistics.dto';
import { GenerateReportDto } from '../dto/statistics-report.dto';
import { Statistics } from '../entities/statistics.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'; // Corregir ruta de importación

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Post()
    @ApiOperation({ summary: 'Crear estadísticas para un usuario', description: 'Crea un nuevo conjunto de estadísticas para un usuario específico.' })
    @ApiBody({ description: 'Datos necesarios para crear las estadísticas', type: CreateStatisticsDto })
    @ApiResponse({ status: 201, description: 'Estadísticas creadas exitosamente', type: Statistics })
    async create(@Body() createStatisticsDto: CreateStatisticsDto): Promise<Statistics> {
        return this.statisticsService.create(createStatisticsDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las estadísticas', description: 'Retorna una lista de todas las estadísticas disponibles.' })
    @ApiResponse({ status: 200, description: 'Lista de estadísticas obtenida exitosamente', type: [Statistics] })
    async findAll(): Promise<Statistics[]> {
        return this.statisticsService.findAll();
    }

	@Get('user/:userId')
	   @ApiOperation({ summary: 'Obtener estadísticas por ID de usuario', description: 'Retorna las estadísticas de un usuario específico.' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
	   @ApiResponse({ status: 200, description: 'Estadísticas del usuario obtenidas exitosamente', type: Statistics })
	@ApiResponse({ status: 404, description: 'No se encontraron estadísticas para el usuario especificado.' })
	   async findByUserId(@Param('userId') userId: string): Promise<Statistics> {
	       return this.statisticsService.findByUserId(userId);
	   }

    @Post('report')
    @ApiOperation({ summary: 'Generar reporte de estadísticas', description: 'Genera un reporte de estadísticas basado en los criterios proporcionados.' })
    @ApiBody({ description: 'Criterios para generar el reporte', type: GenerateReportDto })
    @ApiResponse({ status: 200, description: 'Reporte generado exitosamente', content: { 'application/json': { schema: { type: 'object', description: 'Estructura del reporte generado' } } } })
    async generateReport(@Body() generateReportDto: GenerateReportDto): Promise<any> {
        return this.statisticsService.generateReport(generateReportDto);
    }
}
