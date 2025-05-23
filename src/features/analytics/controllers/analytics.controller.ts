import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContentAnalyticsService } from '../services/content-analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly contentAnalyticsService: ContentAnalyticsService) {}

  @Get('versioning')
  @ApiOperation({ summary: 'Obtener métricas de versionado de contenido' })
  @ApiQuery({ name: 'startDate', description: 'Fecha de inicio (YYYY-MM-DD)', type: String, required: true })
  @ApiQuery({ name: 'endDate', description: 'Fecha de fin (YYYY-MM-DD)', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Métricas de versionado obtenidas exitosamente' })
  @ApiResponse({ status: 400, description: 'Fechas inválidas' })
  getVersioningMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.contentAnalyticsService.getVersioningMetrics(new Date(startDate), new Date(endDate));
  }

  @Get('contributor')
  @ApiOperation({ summary: 'Obtener métricas de contribuyentes' })
  @ApiQuery({ name: 'startDate', description: 'Fecha de inicio (YYYY-MM-DD)', type: String, required: true })
  @ApiQuery({ name: 'endDate', description: 'Fecha de fin (YYYY-MM-DD)', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Métricas de contribuyentes obtenidas exitosamente' })
  @ApiResponse({ status: 400, description: 'Fechas inválidas' })
  getContributorMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.contentAnalyticsService.getContributorMetrics(new Date(startDate), new Date(endDate));
  }

  @Get('quality')
  @ApiOperation({ summary: 'Obtener métricas de calidad de contenido' })
  @ApiQuery({ name: 'startDate', description: 'Fecha de inicio (YYYY-MM-DD)', type: String, required: true })
  @ApiQuery({ name: 'endDate', description: 'Fecha de fin (YYYY-MM-DD)', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Métricas de calidad obtenidas exitosamente' })
  @ApiResponse({ status: 400, description: 'Fechas inválidas' })
  getQualityMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.contentAnalyticsService.getQualityMetrics(new Date(startDate), new Date(endDate));
  }

  @Get('engagement')
  @ApiOperation({ summary: 'Obtener métricas de engagement' })
  @ApiQuery({ name: 'startDate', description: 'Fecha de inicio (YYYY-MM-DD)', type: String, required: true })
  @ApiQuery({ name: 'endDate', description: 'Fecha de fin (YYYY-MM-DD)', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Métricas de engagement obtenidas exitosamente' })
  @ApiResponse({ status: 400, description: 'Fechas inválidas' })
  getEngagementMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.contentAnalyticsService.getEngagementMetrics(new Date(startDate), new Date(endDate));
  }

  @Get('studentProgress')
  @ApiOperation({ summary: 'Obtener progreso de un estudiante' })
  @ApiQuery({ name: 'studentId', description: 'ID del estudiante', type: String, required: true })
  @ApiQuery({ name: 'moduleId', description: 'ID del módulo', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Progreso del estudiante obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'Estudiante o módulo no encontrado' })
  getStudentProgress(
    @Query('studentId') studentId: string,
    @Query('moduleId') moduleId: string,
  ) {
    return this.contentAnalyticsService.getStudentProgress(studentId, moduleId);
  }
}
