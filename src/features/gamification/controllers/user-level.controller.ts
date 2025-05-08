import { Controller, Get, Param, Patch, Body, Post } from '@nestjs/common'; // Importar decoradores necesarios
import { GamificationService } from '@/features/gamification/services/gamification.service'; // Usar ruta absoluta
import { UpdateUserLevelDto } from '../dto/update-user-level.dto'; // Importar DTO
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'; // Importar guard si es necesario
import { UseGuards } from '@nestjs/common'; // Importar UseGuards

@Controller('user-level')
@UseGuards(JwtAuthGuard) // Aplicar guard si es necesario
export class UserLevelController {
  constructor(private readonly gamificationService: GamificationService) {} // Inyectar servicio

  @Get(':userId')
  async getUserLevel(@Param('userId') userId: string) {
    return this.gamificationService.getUserStats(userId);
  }

  @Patch(':userId')
  async updateUserLevel(@Param('userId') userId: string, @Body() updateUserLevelDto: UpdateUserLevelDto) {
    return this.gamificationService.updateStats(userId, updateUserLevelDto);
  }

  @Post(':userId/add-xp')
  async addXp(@Param('userId') userId: string, @Body('xp') xp: number) {
    return this.gamificationService.addPoints(userId, xp);
  }
}
