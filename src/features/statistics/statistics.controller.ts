import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateStatisticsDto } from './dto/create-statistics.dto';
import { GenerateReportDto, ReportType, TimeFrame } from './dto/statistics-report.dto';
import { StatisticsResponseDTO } from './dto/statistics-response.dto';
import { StatisticsService } from './services/statistics.service';
import { Statistics } from './entities/statistics.entity';
import { CategoryMetricsDto } from './dto/category-metrics.dto';
import { LearningPathDto, NextMilestoneDto } from './dto/learning-path.dto';
import { CategoryType, CategoryStatus } from './types/category.enum';
import { UpdateLearningProgressDto } from './dto/update-learning-progress.dto';
import { UpdateAchievementStatsDto } from './dto/update-achievement-stats.dto';
import { UpdateBadgeStatsDto } from './dto/update-badge-stats.dto';
import { UpdateCategoryProgressDto } from './dto/update-category-progress.dto';
import { CategoryMetricsResponseDto } from './dto/category-metrics-response.dto';
import { AvailableCategoryDto } from './dto/available-category.dto';

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear estadísticas para un usuario' })
	@ApiBody({ type: CreateStatisticsDto })
    @ApiResponse({ status: 201, description: 'Estadísticas creadas exitosamente', type: Statistics })
    async create(@Body() createStatisticsDto: CreateStatisticsDto): Promise<Statistics> {
        return this.statisticsService.create(createStatisticsDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las estadísticas' })
    @ApiResponse({ status: 200, description: 'Lista de estadísticas', type: [Statistics] })
    async findAll(): Promise<Statistics[]> {
        return this.statisticsService.findAll();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Obtener estadísticas por ID de usuario' })
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
    @ApiOkResponse({ description: 'Estadísticas del usuario', type: StatisticsResponseDTO })
    async findByUserId(@Param('userId') userId: string): Promise<StatisticsResponseDTO> {
        const statistics = await this.statisticsService.findByUserId(userId);
        const responseDto = new StatisticsResponseDTO();
        Object.assign(responseDto, statistics);
        return responseDto;
    }

    @Put('user/:userId/learning-progress')
    @ApiOperation({ summary: 'Actualizar progreso de aprendizaje' })
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
	@ApiBody({ type: UpdateLearningProgressDto, description: 'Datos para actualizar el progreso de aprendizaje' })
    @ApiResponse({ status: 200, description: 'Progreso actualizado exitosamente', type: Statistics })
    async updateLearningProgress(
        @Param('userId') userId: string,
        @Body() updateLearningProgressDto: UpdateLearningProgressDto
    ): Promise<Statistics> {
        return this.statisticsService.updateLearningProgress(
            userId,
            updateLearningProgressDto.lessonCompleted,
            updateLearningProgressDto.exerciseCompleted,
            updateLearningProgressDto.score,
            updateLearningProgressDto.timeSpentMinutes,
            updateLearningProgressDto.category
        );
    }

    @Put('achievement/:userId')
    @ApiOperation({ summary: 'Update achievement statistics' })
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
	@ApiBody({ type: UpdateAchievementStatsDto, description: 'Datos para actualizar las estadísticas de logros' })
    @ApiResponse({ status: 200, description: 'Achievement statistics updated successfully.', type: Statistics })
    async updateAchievementStats(
        @Param('userId') userId: string,
        @Body() updateAchievementStatsDto: UpdateAchievementStatsDto
    ): Promise<Statistics> {
        return this.statisticsService.updateAchievementStats(userId, updateAchievementStatsDto.achievementCategory);
    }

    @Put('badge/:userId')
    @ApiOperation({ summary: 'Update badge statistics' })
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
	@ApiBody({ type: UpdateBadgeStatsDto, description: 'Datos para actualizar las estadísticas de insignias' })
    @ApiResponse({ status: 200, description: 'Badge statistics updated successfully.', type: Statistics })
    async updateBadgeStats(
        @Param('userId') userId: string,
        @Body() updateBadgeStatsDto: UpdateBadgeStatsDto
    ): Promise<Statistics> {
        return this.statisticsService.updateBadgeStats(userId, updateBadgeStatsDto.badgeTier);
    }

    @Post('user/:userId/report')
    @ApiOperation({ summary: 'Generar reporte de estadísticas' })
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
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
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
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
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
	@ApiParam({ name: 'categoryType', description: 'Tipo de categoría', type: 'string', enum: CategoryType })
	@ApiBody({ type: UpdateCategoryProgressDto, description: 'Datos para actualizar el progreso de la categoría' })
    @ApiResponse({ status: 200, description: 'Progreso actualizado exitosamente', type: Statistics })
    async updateCategoryProgress(
        @Param('userId') userId: string,
        @Param('categoryType') categoryType: CategoryType,
        @Body() updateCategoryProgressDto: UpdateCategoryProgressDto
    ): Promise<Statistics> {
        return this.statisticsService.updateCategoryProgress(
            userId,
            categoryType,
            updateCategoryProgressDto.score,
            updateCategoryProgressDto.timeSpentMinutes,
            updateCategoryProgressDto.exercisesCompleted
        );
    }

    @Get(':userId/category/:categoryType')
    @ApiOperation({ summary: 'Obtener métricas de una categoría específica' })
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
	@ApiParam({ name: 'categoryType', description: 'Tipo de categoría', type: 'string', enum: CategoryType })
    @ApiResponse({ status: 200, description: 'Métricas de categoría encontradas exitosamente', type: CategoryMetricsResponseDto })
    async getCategoryMetrics(
        @Param('userId') userId: string,
        @Param('categoryType') categoryType: CategoryType
    ): Promise<CategoryMetricsResponseDto> {
        const statistics = await this.statisticsService.findByUserId(userId);
        const category = statistics?.categoryMetrics?.[categoryType]; // Acceso seguro
        if (!category || !category.progress) {
            return {
                type: categoryType,
                lessonsCompleted: 0, // No existe a nivel de categoría, se pone 0
                exercisesCompleted: 0, // No existe a nivel de categoría, se pone 0
                averageScore: 0,
                timeSpentMinutes: 0,
            };
        }
        return {
            type: category.type,
            lessonsCompleted: 0, // No existe a nivel de categoría, se pone 0
            exercisesCompleted: category.progress.completedExercises, // Usar completedExercises de la categoría
            averageScore: category.progress.averageScore,
            timeSpentMinutes: category.progress.timeSpentMinutes,
        };
    }

    @Get(':userId/learning-path')
    @ApiOperation({ summary: 'Obtener ruta de aprendizaje del usuario' })
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
    @ApiResponse({ status: 200, description: 'Ruta de aprendizaje encontrada exitosamente', type: LearningPathDto })
    async getLearningPath(@Param('userId') userId: string): Promise<LearningPathDto> {
        const statistics = await this.statisticsService.findByUserId(userId);
        if (!statistics || !statistics.learningPath) {
            return {
                currentLevel: 0,
                nextMilestones: [],
                recommendedCategories: [], // Añadir la propiedad requerida
            };
        }
        return statistics.learningPath;
    }

    @Get(':userId/available-categories')
    @ApiOperation({ summary: 'Obtener categorías disponibles para el usuario' })
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
    @ApiResponse({ status: 200, description: 'Categorías disponibles encontradas exitosamente', type: [AvailableCategoryDto] })
    async getAvailableCategories(@Param('userId') userId: string): Promise<AvailableCategoryDto[]> {
        const stats = await this.statisticsService.findByUserId(userId);
        if (!stats || !stats.categoryMetrics) {
            return [];
        }

        return Object.entries(stats.categoryMetrics as Record<CategoryType, CategoryMetricsDto>)
            .filter(([_, category]) => category.status === CategoryStatus.AVAILABLE)
            .map(([type, category]) => ({
                type: type as CategoryType,
                difficulty: category.difficulty,
                status: category.status,
                lessonsCompleted: 0, // No existe a nivel de categoría, se pone 0
                exercisesCompleted: category.progress?.completedExercises || 0, // Usar completedExercises de la categoría
                averageScore: category.progress?.averageScore || 0,
                timeSpentMinutes: category.progress?.timeSpentMinutes || 0,
            }));
    }

    @Get(':userId/next-milestones')
    @ApiOperation({ summary: 'Obtener próximos hitos del usuario' })
	@ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string' })
    @ApiResponse({ status: 200, description: 'Próximos hitos encontrados exitosamente', type: [NextMilestoneDto] })
    async getNextMilestones(@Param('userId') userId: string): Promise<NextMilestoneDto[]> {
        const statistics = await this.statisticsService.findByUserId(userId);
        if (!statistics || !statistics.learningPath || !statistics.learningPath.nextMilestones) {
            return [];
        }
        return statistics.learningPath.nextMilestones;
    }
}
