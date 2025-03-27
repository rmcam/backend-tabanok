import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateGamificationDto } from './dto/create-gamification.dto';
import { Gamification } from './entities/gamification.entity';
import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@Controller('gamification')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new gamification record' })
    @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: Gamification })
    async create(@Body() createGamificationDto: CreateGamificationDto): Promise<Gamification> {
        return this.gamificationService.create(createGamificationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all gamification records' })
    @ApiResponse({ status: 200, description: 'Return all gamification records.', type: [Gamification] })
    async findAll(): Promise<Gamification[]> {
        return this.gamificationService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a gamification record by id' })
    @ApiResponse({ status: 200, description: 'Return the gamification record.', type: Gamification })
    @ApiResponse({ status: 404, description: 'Record not found.' })
    async findOne(@Param('id') id: string): Promise<Gamification> {
        return this.gamificationService.findOne(id);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get gamification record by user id' })
    @ApiResponse({ status: 200, description: 'Return the gamification record.', type: Gamification })
    @ApiResponse({ status: 404, description: 'Record not found.' })
    async findByUserId(@Param('userId') userId: string): Promise<Gamification> {
        return this.gamificationService.findByUserId(userId);
    }

    @Post('points/:userId')
    @ApiOperation({ summary: 'Add points to a user' })
    @ApiResponse({ status: 200, description: 'Points added successfully.', type: Gamification })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async addPoints(
        @Param('userId') userId: string,
        @Body() body: { points: number; activityType: string; description: string }
    ): Promise<Gamification> {
        return this.gamificationService.addPoints(
            userId,
            body.points,
            body.activityType,
            body.description
        );
    }

    @Put('stats/:userId')
    @ApiOperation({ summary: 'Update user stats' })
    @ApiResponse({ status: 200, description: 'Stats updated successfully.', type: Gamification })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async updateStats(
        @Param('userId') userId: string,
        @Body() stats: Partial<Gamification['stats']>
    ): Promise<Gamification> {
        return this.gamificationService.updateStats(userId, stats);
    }
} 