import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Reward } from './entities/reward.entity';
import { RewardService } from './reward.service';

@ApiTags('Recompensas')
@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardController {
  constructor(private readonly rewardService: RewardService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nueva recompensa' })
  @ApiResponse({ status: 201, description: 'Recompensa creada exitosamente' })
  create(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardService.create(createRewardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las recompensas' })
  @ApiResponse({ status: 200, description: 'Lista de recompensas' })
  findAll(): Promise<Reward[]> {
    return this.rewardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener recompensa por ID' })
  @ApiResponse({ status: 200, description: 'Recompensa encontrada' })
  findOne(@Param('id') id: string): Promise<Reward> {
    return this.rewardService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener recompensas de un usuario' })
  @ApiResponse({ status: 200, description: 'Lista de recompensas del usuario' })
  @ApiParam({ name: 'userId', type: 'number' })
  findByUser(@Param('userId') userId: number): Promise<Reward[]> {
    return this.rewardService.findByUser(userId);
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: 'Desbloquear una recompensa' })
  @ApiResponse({ status: 200, description: 'Recompensa desbloqueada' })
  unlockReward(@Param('id') id: string, @Req() req): Promise<Reward> {
    return this.rewardService.unlockReward(id, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar recompensa' })
  @ApiResponse({ status: 200, description: 'Recompensa eliminada' })
  remove(@Param('id') id: string): Promise<void> {
    return this.rewardService.remove(id);
  }
}
