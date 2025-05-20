import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator'; // Importar el decorador Public

@Controller()
export class RootController {
  @Public()
  @Get('healthz')
  @ApiOperation({ summary: 'Verifica el estado de la API', description: 'Retorna un estado "ok" si la API está funcionando correctamente.' })
  @ApiResponse({ status: 200, description: 'La API está funcionando correctamente', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, message: { type: 'string', example: 'Tabanok API' } } } } } })
  health() {
    return { status: 'ok', message: 'Tabanok API' };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Obtener mensaje de bienvenida', description: 'Retorna un mensaje de bienvenida de la API.' })
  @ApiResponse({ status: 200, description: 'Mensaje de bienvenida obtenido exitosamente', content: { 'text/plain': { schema: { type: 'string', example: 'Tabanok API is running!' } } } })
  getHello(): string {
    return 'Tabanok API is running!';
  }
}
