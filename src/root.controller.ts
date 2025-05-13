import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator'; // Importar el decorador Public

@Controller()
export class RootController {
  @Public() // Marcar esta ruta como pública
  @Get('healthz')
  health() {
    return { status: 'ok', message: 'Tabanok API' };
  }

  @Public() // Marcar esta ruta como pública
  @Get()
  getHello(): string {
    return 'Tabanok API is running!';
  }
}
