import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/entities/user.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { AchievementFilterDto, CreateAchievementDto, UpdateProgressDto } from '../dto/cultural-achievement.dto';
import { CulturalAchievementService } from '../services/cultural-achievement.service';

@Controller('cultural-achievements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CulturalAchievementController {
    constructor(private readonly achievementService: CulturalAchievementService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    async createAchievement(@Body() createAchievementDto: CreateAchievementDto) {
        return this.achievementService.createAchievement(createAchievementDto);
    }

    @Get()
    async getAchievements(@Query() filter: AchievementFilterDto) {
        return this.achievementService.getAchievements(filter.category);
    }

    @Post(':achievementId/progress/:userId')
    @Roles(UserRole.ADMIN, UserRole.MODERATOR)
    async initializeProgress(
        @Param('userId') userId: string,
        @Param('achievementId') achievementId: string
    ) {
        return this.achievementService.initializeUserProgress(userId, achievementId);
    }

    @Put(':achievementId/progress/:userId')
    async updateProgress(
        @Param('userId') userId: string,
        @Param('achievementId') achievementId: string,
        @Body() updateProgressDto: UpdateProgressDto
    ) {
        return this.achievementService.updateProgress(
            userId,
            achievementId,
            updateProgressDto.updates
        );
    }

    @Get('users/:userId')
    async getUserAchievements(@Param('userId') userId: string) {
        return this.achievementService.getUserAchievements(userId);
    }

    @Get(':achievementId/progress/:userId')
    async getAchievementProgress(
        @Param('userId') userId: string,
        @Param('achievementId') achievementId: string
    ) {
        return this.achievementService.getAchievementProgress(userId, achievementId);
    }
} 