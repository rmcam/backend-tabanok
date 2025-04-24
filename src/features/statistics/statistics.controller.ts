import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateStatisticsDto } from './dto/create-statistics.dto';
import { GenerateReportDto, ReportType, TimeFrame } from './dto/statistics-report.dto';
import { StatisticsResponseDTO } from './dto/statistics-response.dto';
import { Statistics } from './entities/statistics.entity';
import { Category } from './interfaces/category.interface';
import { StatisticsService } from './statistics.service';
import { CategoryStatus, CategoryType } from './types/category.enum';

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear estadísticas para un usuario' })
	@ApiBody({ type: CreateStatisticsDto })
    @ApiResponse({ status: 201, description: 'Estadísticas creadas exitosamente' })
    async create(@Body() createStatisticsDto: CreateStatisticsDto) {
        return this.statisticsService.create(createStatisticsDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las estadísticas' })
    @ApiResponse({ status: 200, description: 'Lista de estadísticas' })
    async findAll() {
        return this.statisticsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener estadísticas por ID' })
	@ApiParam({ name: 'id', description: 'ID de las estadísticas' })
    @ApiResponse({ status: 200, description: 'Estadísticas encontradas' })
    @ApiResponse({ status: 404, description: 'Estadísticas no encontradas' })
    async findOne(@Param('id') id: string) {
        return this.statisticsService.findOne(id);
    }

    @Get(':userId')
    @ApiOperation({ summary: 'Obtener estadísticas por ID de usuario' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiOkResponse({ type: StatisticsResponseDTO })
    async findByUserId(@Param('userId') userId: string) {
        const statistics = await this.statisticsService.findByUserId(userId);
        return statistics;
    }

    @Put('user/:userId/learning-progress')
    @ApiOperation({ summary: 'Actualizar progreso de aprendizaje' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
	@ApiBody({ schema: { type: 'object', properties: { lessonCompleted: { type: 'boolean' }, exerciseCompleted: { type: 'boolean' }, score: { type: 'number' }, timeSpentMinutes: { type: 'number' }, category: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Progreso actualizado exitosamente' })
    async updateLearningProgress(
        @Param('userId') userId: string,
        @Body() body: {
            lessonCompleted: boolean;
            exerciseCompleted: boolean;
            score: number;
            timeSpentMinutes: number;
            category: CategoryType;
        }
    ) {
        return this.statisticsService.updateLearningProgress(
            userId,
            body.lessonCompleted,
            body.exerciseCompleted,
            body.score,
            body.timeSpentMinutes,
            body.category
        );
    }

    @Put('achievement/:userId')
    @ApiOperation({ summary: 'Update achievement statistics' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
	@ApiBody({ schema: { type: 'object', properties: { achievementCategory: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Achievement statistics updated successfully.', type: Statistics })
    async updateAchievementStats(
        @Param('userId') userId: string,
        @Body() body: { achievementCategory: string }
    ): Promise<Statistics> {
        return this.statisticsService.updateAchievementStats(userId, body.achievementCategory);
    }

    @Put('badge/:userId')
    @ApiOperation({ summary: 'Update badge statistics' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
	@ApiBody({ schema: { type: 'object', properties: { badgeTier: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Badge statistics updated successfully.', type: Statistics })
    async updateBadgeStats(
        @Param('userId') userId: string,
        @Body() body: { badgeTier: string }
    ): Promise<Statistics> {
        return this.statisticsService.updateBadgeStats(userId, body.badgeTier);
    }

    @Post('user/:userId/report')
    @ApiOperation({ summary: 'Generar reporte de estadísticas' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
	@ApiBody({ type: GenerateReportDto })
    @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
    async generateReport(
        @Param('userId') userId: string,
        @Body() generateReportDto: GenerateReportDto
    ) {
        return this.statisticsService.generateReport(generateReportDto);
    }

    @Get('reports/quick/:userId')
    @ApiOperation({ summary: 'Generate quick comprehensive report' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Quick report generated successfully.' })
    async generateQuickReport(@Param('userId') userId: string): Promise<any> {
        const quickReportDto: GenerateReportDto = {
            userId,
            reportType: ReportType.COMPREHENSIVE,
            timeFrame: TimeFrame.MONTHLY
        };
        return this.statisticsService.generateReport(quickReportDto);
    }

    @Put(':userId/category/:categoryType/progress')
    @ApiOperation({ summary: 'Actualizar progreso de una categoría' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
	@ApiParam({ name: 'categoryType', description: 'Tipo de categoría' })
	@ApiBody({ schema: { type: 'object', properties: { score: { type: 'number' }, timeSpentMinutes: { type: 'number' }, exercisesCompleted: { type: 'number' } } } })
    @ApiResponse({ status: 200, description: 'Progreso actualizado exitosamente' })
    async updateCategoryProgress(
        @Param('userId') userId: string,
        @Param('categoryType') categoryType: CategoryType,
        @Body() updateData: {
            score: number;
            timeSpentMinutes: number;
            exercisesCompleted: number;
        }
    ) {
        return this.statisticsService.updateCategoryProgress(
            userId,
            categoryType,
            updateData.score,
            updateData.timeSpentMinutes,
            updateData.exercisesCompleted
        );
    }

    @Get(':userId/category/:categoryType')
    @ApiOperation({ summary: 'Obtener métricas de una categoría específica' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
	@ApiParam({ name: 'categoryType', description: 'Tipo de categoría' })
    @ApiResponse({ status: 200, description: 'Métricas de categoría encontradas exitosamente' })
    async getCategoryMetrics(
        @Param('userId') userId: string,
        @Param('categoryType') categoryType: CategoryType
    ) {
        const statistics = await this.statisticsService.findByUserId(userId);
        return statistics.categoryMetrics[categoryType];
    }

    @Get(':userId/learning-path')
    @ApiOperation({ summary: 'Obtener ruta de aprendizaje del usuario' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Ruta de aprendizaje encontrada exitosamente' })
    async getLearningPath(@Param('userId') userId: string) {
        const statistics = await this.statisticsService.findByUserId(userId);
        return statistics.learningPath;
    }

    @Get(':userId/available-categories')
    @ApiOperation({ summary: 'Obtener categorías disponibles para el usuario' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Categorías disponibles encontradas exitosamente' })
    async getAvailableCategories(@Param('userId') userId: string) {
        const stats = await this.statisticsService.findByUserId(userId);
        if (!stats) {
            return [];
        }

        return Object.entries(stats.categoryMetrics as Record<CategoryType, Category>)
            .filter(([_, category]) => category.status === CategoryStatus.AVAILABLE)
            .map(([type, category]) => ({
                type,
                ...category
            }));
    }

    @Get(':userId/next-milestones')
    @ApiOperation({ summary: 'Obtener próximos hitos del usuario' })
	@ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiResponse({ status: 200, description: 'Próximos hitos encontrados exitosamente' })
    async getNextMilestones(@Param('userId') userId: string) {
        const statistics = await this.statisticsService.findByUserId(userId);
        return statistics.learningPath.nextMilestones;
    }
}
