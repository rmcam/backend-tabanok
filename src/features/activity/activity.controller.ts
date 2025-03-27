import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityType, DifficultyLevel } from './entities/activity.entity';

@ApiTags('Activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }

  @Get()
  findAll() {
    return this.activityService.findAll();
  }

  @Get('random')
  getRandomActivities(@Query('limit') limit: number = 5) {
    return this.activityService.getRandomActivities(limit);
  }

  @Get('type/:type')
  findByType(@Param('type') type: ActivityType) {
    return this.activityService.findByType(type);
  }

  @Get('difficulty/:level')
  findByDifficultyLevel(@Param('level') level: DifficultyLevel) {
    return this.activityService.findByDifficultyLevel(level);
  }

  @Get('topic/:topicId')
  findByTopic(@Param('topicId') topicId: string) {
    return this.activityService.findByTopic(topicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activityService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.activityService.remove(id);
  }

  @Post(':id/validate')
  validateAnswer(
    @Param('id') id: string,
    @Body() body: { questionIndex: number; answer: string },
  ) {
    return this.activityService.validateAnswer(id, body.questionIndex, body.answer);
  }
}
