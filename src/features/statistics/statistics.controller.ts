import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStatisticsDto } from './dto/create-statistics.dto';
import { GenerateReportDto, ReportType, TimeFrame } from './dto/generate-report.dto';
import { Statistics } from './entities/statistics.entity';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Post()
    @ApiOperation({ summary: 'Create statistics record' })
    @ApiResponse({ status: 201, description: 'Statistics record created successfully.', type: Statistics })
    async create(@Body() createStatisticsDto: CreateStatisticsDto): Promise<Statistics> {
        return this.statisticsService.create(createStatisticsDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all statistics records' })
    @ApiResponse({ status: 200, description: 'Return all statistics records.', type: [Statistics] })
    async findAll(): Promise<Statistics[]> {
        return this.statisticsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get statistics record by id' })
    @ApiResponse({ status: 200, description: 'Return the statistics record.', type: Statistics })
    @ApiResponse({ status: 404, description: 'Record not found.' })
    async findOne(@Param('id') id: string): Promise<Statistics> {
        return this.statisticsService.findOne(id);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get statistics by user id' })
    @ApiResponse({ status: 200, description: 'Return the user statistics.', type: Statistics })
    @ApiResponse({ status: 404, description: 'User statistics not found.' })
    async findByUserId(@Param('userId') userId: string): Promise<Statistics> {
        return this.statisticsService.findByUserId(userId);
    }

    @Post('learning-progress/:userId')
    @ApiOperation({ summary: 'Update learning progress' })
    @ApiResponse({ status: 200, description: 'Learning progress updated successfully.', type: Statistics })
    async updateLearningProgress(
        @Param('userId') userId: string,
        @Body() body: {
            lessonCompleted: boolean;
            exerciseCompleted: boolean;
            score: number;
            timeSpentMinutes: number;
            category: string;
        }
    ): Promise<Statistics> {
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
    @ApiResponse({ status: 200, description: 'Achievement statistics updated successfully.', type: Statistics })
    async updateAchievementStats(
        @Param('userId') userId: string,
        @Body() body: { achievementCategory: string }
    ): Promise<Statistics> {
        return this.statisticsService.updateAchievementStats(userId, body.achievementCategory);
    }

    @Put('badge/:userId')
    @ApiOperation({ summary: 'Update badge statistics' })
    @ApiResponse({ status: 200, description: 'Badge statistics updated successfully.', type: Statistics })
    async updateBadgeStats(
        @Param('userId') userId: string,
        @Body() body: { badgeTier: string }
    ): Promise<Statistics> {
        return this.statisticsService.updateBadgeStats(userId, body.badgeTier);
    }

    @Post('reports/generate')
    @ApiOperation({ summary: 'Generate custom statistics report' })
    @ApiResponse({ status: 200, description: 'Report generated successfully.' })
    async generateReport(@Body() generateReportDto: GenerateReportDto): Promise<any> {
        return this.statisticsService.generateReport(generateReportDto);
    }

    @Get('reports/quick/:userId')
    @ApiOperation({ summary: 'Generate quick comprehensive report' })
    @ApiResponse({ status: 200, description: 'Quick report generated successfully.' })
    async generateQuickReport(@Param('userId') userId: string): Promise<any> {
        const quickReportDto: GenerateReportDto = {
            userId,
            reportType: ReportType.COMPREHENSIVE,
            timeFrame: TimeFrame.MONTHLY
        };
        return this.statisticsService.generateReport(quickReportDto);
    }
} 