import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboardService } from '../services/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * @description Obtiene la tabla de clasificación.
   * @returns Una lista de entradas de la tabla de clasificación.
   */
  @Get()
  async getLeaderboard(): Promise<any[]> {
    return await this.leaderboardService.getLeaderboard();
  }

  /**
   * @description Obtiene el rango de un usuario en la tabla de clasificación.
   * @param userId ID del usuario.
   * @returns El rango del usuario.
   */
  @Get(':userId')
  async getUserRank(@Param('userId') userId: string): Promise<any> {
    return await this.leaderboardService.getUserRank(userId);
  }
}
