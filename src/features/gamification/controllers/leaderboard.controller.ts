import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { NotFoundException } from "@nestjs/common"; // Import NotFoundException
import { LeaderboardService } from "../services/leaderboard.service";
import { LeaderboardEntryDto } from "./../dto/leaderboard-entry.dto";

@ApiTags("Gamification - Leaderboard")
@ApiBearerAuth()
@Controller("leaderboard")
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: "Obtiene la tabla de clasificación" })
  @ApiResponse({
    status: 200,
    description: "Tabla de clasificación obtenida exitosamente",
    type: [LeaderboardEntryDto],
  })
  @ApiResponse({ status: 401, description: "No autorizado" })
  @ApiResponse({ status: 404, description: "Tabla de clasificación no encontrada" }) // Add 404 response
  @ApiResponse({ status: 500, description: "Error interno del servidor" })
  async getLeaderboard(): Promise<LeaderboardEntryDto[]> {
    const leaderboard = await this.leaderboardService.getLeaderboard();
    if (!leaderboard) {
      throw new NotFoundException('Tabla de clasificación no encontrada');
    }
    return leaderboard;
  }

  @Get(":userId")
  @ApiOperation({
    summary: "Obtiene el rango de un usuario en la tabla de clasificación",
  })
  @ApiParam({ name: "userId", description: "ID del usuario", type: "string" })
  @ApiResponse({
    status: 200,
    description: "Rango del usuario obtenido exitosamente",
    type: Number,
  }) // Asumiendo que getUserRank devuelve un número
  @ApiResponse({ status: 401, description: "No autorizado" })
  @ApiResponse({
    status: 404,
    description: "Usuario no encontrado en la tabla de clasificación",
  }) // Si el servicio lanza NotFoundException
  async getUserRank(@Param("userId") userId: string): Promise<number> {
    // Ajustar tipo de retorno si es necesario
    // El servicio getUserRank ya maneja el caso de usuario no encontrado devolviendo 0 o lanzando excepción.
    // Se asume que devuelve un número (el rango) o 0 si no está en el leaderboard.
    return await this.leaderboardService.getUserRank(userId);
  }
}
