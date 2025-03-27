import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardType } from './entities/reward.entity';
import { RewardService } from './reward.service';

@ApiTags('rewards')
@Controller('rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) { }

  @Post()
  create(@Body() createRewardDto: CreateRewardDto) {
    return this.rewardService.create(createRewardDto);
  }

  @Get()
  findAll() {
    return this.rewardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rewardService.findOne(id);
  }

  @Get('type/:type')
  findByType(@Param('type') type: RewardType) {
    return this.rewardService.findByType(type);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.rewardService.findByUser(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRewardDto: UpdateRewardDto) {
    return this.rewardService.update(id, updateRewardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rewardService.remove(id);
  }

  @Patch(':id/points')
  updatePoints(@Param('id') id: string, @Body('points') points: number) {
    return this.rewardService.updatePoints(id, points);
  }

  @Patch(':id/toggle-secret')
  toggleSecret(@Param('id') id: string) {
    return this.rewardService.toggleSecret(id);
  }
} 